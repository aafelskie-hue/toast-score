import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";
import { getToastById, getCertificateByToastId } from "@/lib/queries";
import { generateCertificatePdf } from "@/lib/certificate";

interface PageProps {
  params: Promise<{ "toast-id": string }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const { "toast-id": toastId } = await params;
  const supabase = getSupabaseServer();

  // 1. Check for existing certificate
  const existing = await getCertificateByToastId(toastId);
  if (existing) {
    // Fetch from storage and return
    const { data, error } = await supabase.storage
      .from("certificates")
      .download(existing.storage_path);

    if (!error && data) {
      const buffer = new Uint8Array(await data.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="toast-certificate-${toastId.slice(0, 8)}.pdf"`,
        },
      });
    }
    // If storage fetch fails, regenerate below
  }

  // 2. Verify payment
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  if (session.metadata?.toast_id !== toastId) {
    return NextResponse.json({ error: "Session does not match toast" }, { status: 400 });
  }

  // 3. Fetch toast
  const toast = await getToastById(toastId);
  if (!toast) {
    return NextResponse.json({ error: "Toast not found" }, { status: 404 });
  }

  // 4. Pre-download image as base64 (avoid @react-pdf/renderer remote fetch issues)
  const imageResponse = await fetch(toast.image_url);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch toast image" }, { status: 500 });
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const resizedBuffer = await sharp(imageBuffer)
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
  const imageBase64 = resizedBuffer.toString("base64");

  // 5. Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateCertificatePdf(toast, imageBase64);
  } catch (err) {
    console.error("[certificate] PDF generation failed:", err);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }

  // 6. Upload to storage
  const storagePath = `${toastId}.pdf`;
  await supabase.storage
    .from("certificates")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  // 7. Record in database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("certificates") as any).insert({
    toast_id: toastId,
    stripe_session_id: sessionId,
    storage_path: storagePath,
  });

  // 8. Return PDF
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="toast-certificate-${toastId.slice(0, 8)}.pdf"`,
    },
  });
}
