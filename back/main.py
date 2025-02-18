from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from rdflib import Graph, Namespace
import unicodedata

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ฟังก์ชัน normalize ที่จะใช้แปลงข้อความ
def normalize(text):
    return unicodedata.normalize("NFKC", text).lower()

def load_ontology_data():
    try:
        g = Graph()
        g.parse("mytourism.owl", format="xml")
        mytourism = Namespace("http://www.my_ontology.edu/mytourism#")
        
        data = []
        # สร้าง dictionary เพื่อเก็บข้อมูลชื่อจังหวัดและชื่อดั้งเดิม
        province_names_map = {}
        traditional_names_map = {}
        
        # รอบแรก: เก็บชื่อจังหวัดและชื่อดั้งเดิม
        for subj, pred, obj in g:
            pred_label = str(pred).replace(str(mytourism), "mytourism:")
            province = str(subj).replace(str(mytourism), "mytourism:")
            
            if "hasNameOfProvince" in pred_label:
                if province not in province_names_map:
                    province_names_map[province] = []
                province_names_map[province].append(str(obj))
                
            if "hasTraditionalNameOfProvince" in pred_label:
                if province not in traditional_names_map:
                    traditional_names_map[province] = []
                traditional_names_map[province].append(str(obj))

        # รอบที่สอง: สร้างข้อมูลหลักพร้อมชื่อจังหวัดและชื่อดั้งเดิม
        for subj, pred, obj in g:
            subj_label = str(subj).replace(str(mytourism), "mytourism:")
            pred_label = str(pred).replace(str(mytourism), "mytourism:")
            
            if isinstance(obj, Namespace) or str(obj).startswith("http"):
                obj_label = str(obj).replace(str(mytourism), "mytourism:")
            else:
                obj_label = str(obj)

            if "owl#" not in obj_label:
                item = {
                    "subject": subj_label,
                    "predicate": pred_label,
                    "object": obj_label,
                }
                # เพิ่มชื่อจังหวัด
                if subj_label in province_names_map:
                    item["province_names"] = province_names_map[subj_label]
                # เพิ่มชื่อดั้งเดิม
                if subj_label in traditional_names_map:
                    item["traditional_names"] = traditional_names_map[subj_label]
                data.append(item)
                
        print("✅ OWL Data Loaded:", len(data), "items")
        return data
    except Exception as e:
        print(f"❌ Error loading OWL file: {e}")
        return []


ontology_data = load_ontology_data()

@app.get("/search")
def search_ontology(query: str):
    query = normalize(query.strip().lower())
    results = []
    suggestions = []

    for item in ontology_data:
        province_names = [name.replace("mytourism:", "") for name in item.get("province_names", [])]

        # หาจังหวัดที่ "ขึ้นต้น" ด้วยคำค้นหา
        for name in province_names:
            if normalize(name.lower()).startswith(query) and name not in suggestions:
                suggestions.append(name)

        # หาผลลัพธ์จริง
        if any(query in normalize(name.lower()) for name in province_names):
            results.append(item)

    return {"results": results, "suggestions": suggestions}
