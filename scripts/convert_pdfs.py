import os
import sys
import glob

try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF not installed. Please run: pip install pymupdf")
    sys.exit(1)

def convert_pdf_to_jpg(pdf_path):
    print(f"Processing: {pdf_path}")
    try:
        doc = fitz.open(pdf_path)
        base_path = os.path.splitext(pdf_path)[0]
        
        # Determine if multi-page
        num_pages = len(doc)
        for i in range(num_pages):
            page = doc.load_page(i)
            # Render at 300 DPI roughly
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            
            if num_pages == 1:
                out_path = f"{base_path}.png"
            else:
                out_path = f"{base_path}_page_{i+1}.png"
                
            pix.save(out_path)
            print(f"Saved: {out_path}")
            
        doc.close()
        
        # Delete original PDF after successful conversion
        os.remove(pdf_path)
        print(f"Deleted original PDF: {pdf_path}")
        
    except Exception as e:
        print(f"Failed to convert {pdf_path}: {e}")

if __name__ == "__main__":
    project_works_dir = os.path.join("public", "PROJECT WORKS")
    if not os.path.exists(project_works_dir):
        print(f"Directory not found: {project_works_dir}")
        sys.exit(1)
        
    # Find all PDFs recursively
    pdf_files = glob.glob(os.path.join(project_works_dir, "**", "*.pdf"), recursive=True)
    print(f"Found {len(pdf_files)} PDF files to convert.")
    
    for pdf in pdf_files:
        convert_pdf_to_jpg(pdf)
        
    print("Done converting PDFs.")
