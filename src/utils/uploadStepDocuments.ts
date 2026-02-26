import { storeRequiredDocuments } from "../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";

/**
 * Validates that all required documents for the given step have files,
 * then uploads each document via storeRequiredDocuments.
 *
 * @param stepNo       - The current application step number
 * @param requiredDocs - The full required documents array from Redux
 * @param docFiles     - Map of document ID → File uploaded by user
 * @returns true if all uploads succeeded (or no docs needed), false otherwise
 */
export async function uploadStepDocuments(
  stepNo: number,
  requiredDocs: any[],
  docFiles: Record<number, File | null>
): Promise<boolean> {
  const stepDocs = (requiredDocs || []).filter(
    (doc: any) => Number(doc.step_no) === stepNo
  );

  if (stepDocs.length === 0) return true;

  // Validate: every required doc must have a file
  for (const doc of stepDocs) {
    if (doc.is_required && !docFiles[doc.id]) {
      toast.error(`Please upload: ${doc.name_en}`);
      return false;
    }
  }

  // Upload each doc that has a file
  for (const doc of stepDocs) {
    const file = docFiles[doc.id];
    if (!file) continue; // skip optional docs without a file

    const fd = new FormData();
    fd.append("product_id", String(doc.product_id));
    fd.append("name_en", doc.name_en || "");
    fd.append("name_ar", doc.name_ar || "");
    fd.append("type", "upload");
    fd.append("status", "1");
    fd.append("is_required", doc.is_required ? "1" : "0");
    fd.append("category", doc.category || "Upload");
    fd.append("step_no", String(doc.step_no));
    fd.append("doc_file", file);

    try {
      const res = await storeRequiredDocuments(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || `Failed to upload ${doc.name_en}`);
        return false;
      }
    } catch (err: any) {
      console.error(`Error uploading ${doc.name_en}:`, err);
      toast.error(
        err?.response?.data?.message || `Failed to upload ${doc.name_en}`
      );
      return false;
    }
  }

  return true;
}
