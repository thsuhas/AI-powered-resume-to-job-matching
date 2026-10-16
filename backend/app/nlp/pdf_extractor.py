import io
import re
from typing import Tuple, List
import pymupdf as fitz

class PDFExtractionError(Exception):
    """Custom exception raised when PDF text extraction fails or yields unusable content."""
    pass

def extract_text_from_pdf_bytes(pdf_bytes: bytes, filename: str = "resume.pdf") -> Tuple[str, List[str]]:
    """
    Extracts text from PDF byte content safely using PyMuPDF.

    Returns:
        (extracted_text, list_of_warnings)
    Raises:
        PDFExtractionError: if PDF is encrypted, corrupted, or contains unusable text.
    """
    warnings: List[str] = []

    if not pdf_bytes or len(pdf_bytes) == 0:
        raise PDFExtractionError("The uploaded file is empty.")

    try:
        # Open PDF document from byte stream
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise PDFExtractionError(f"Failed to parse PDF file '{filename}'. The file may be corrupted or not a valid PDF: {str(e)}")

    if doc.is_encrypted:
        doc.close()
        raise PDFExtractionError("The uploaded PDF is password-protected or encrypted. Please upload an unprotected PDF.")

    page_count = len(doc)
    if page_count == 0:
        doc.close()
        raise PDFExtractionError("The uploaded PDF has 0 pages.")

    if page_count > 10:
        warnings.append(f"Resume has {page_count} pages, which is longer than typical 1-2 page resumes.")

    extracted_pages = []
    for page_num in range(page_count):
        try:
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                extracted_pages.append(text.strip())
        except Exception as e:
            warnings.append(f"Could not extract text from page {page_num + 1}: {str(e)}")

    doc.close()

    full_text = "\n\n".join(extracted_pages).strip()

    # Clean non-printable characters while preserving standard formatting
    cleaned_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', full_text)

    # Check if text is essentially empty or just a scanned image
    non_space_chars = len(re.sub(r'\s+', '', cleaned_text))
    if non_space_chars < 30:
        raise PDFExtractionError(
            "The uploaded PDF contains insufficient extractable digital text (fewer than 30 readable characters). "
            "It appears to be a scanned image or photo PDF. CareerLens currently parses selectable text and does not "
            "include OCR for scanned images. Please export your resume as a standard PDF from Word, Google Docs, or LaTeX."
        )

    return cleaned_text, warnings
