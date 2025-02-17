from rdflib import Graph

def load_ontology_data():
    try:
        g = Graph()
        g.parse("mytourism.owl", format="xml")  # ✅ ตรวจสอบว่าไฟล์อยู่จริง

        data = []
        for subj, pred, obj in g:
            data.append({
                "subject": str(subj),
                "predicate": str(pred),
                "object": str(obj)  # ✅ ใช้ "object" แทน "name"
            })
        
        print("✅ OWL Data Loaded:", data[:5])  # Debug ดู 5 รายการแรก
        return data
    except Exception as e:
        print(f"❌ Error loading OWL file: {e}")
        return []
