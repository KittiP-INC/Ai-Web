import { useState, useEffect } from "react";
import "./App.css"; // ใช้ไฟล์ CSS สำหรับจัดตำแหน่ง

function App() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // ฟังก์ชันโหลด "คำแนะนำ" ขณะพิมพ์
    const handleSuggest = async (input) => {
        if (input.trim() === "") {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:8000/search?query=${input}`);
            const data = await res.json();
            console.log("📌 Suggestions:", data.suggestions);
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    // ฟังก์ชัน "ค้นหาข้อมูลจริง" (เรียก API เฉพาะเมื่อกดปุ่ม "ค้นหา")
    const handleSearch = async () => {
        if (query.trim() === "") return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/search?query=${query}`);
            const data = await res.json();
            setResults(data.results?.map(item => ({
                subject: item.subject.replace("mytourism:", ""),
                object: item.object.replace("mytourism:", "")
            })) || []);
            setSuggestions([]); // เคลียร์คำแนะนำหลังจากกดค้นหา
        } catch (error) {
            console.error("Error fetching data:", error);
            setResults([]);
        }
    };

    // ใช้ `useEffect()` โหลดคำแนะนำขณะพิมพ์ (แต่ไม่ค้นหาข้อมูลจริง)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSuggest(query);
        }, 300); // รอ 300ms หลังจากพิมพ์

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="search-container">
            <h1>โปรดใส่ชื่อจังหวัด</h1>
            <div className="input-wrapper">
                <input
                    type="text"
                    list="suggestions-list"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="พิมพ์ชื่อจังหวัดตรงนี้"
                />
                <datalist id="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <option key={index} value={suggestion} />
                    ))}
                </datalist>
            </div>
            <button onClick={handleSearch}>ค้นหา</button>

            {/* แสดงผลลัพธ์เฉพาะเมื่อกดค้นหา */}
            <div>
                {results.length > 0 ? (
                    <ul>
                        {results.map((item, index) => (
                            <li key={index}>
                                <strong>{item.subject}</strong>: {item.object}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>ไม่มีผลลัพธ์</p>
                )}
            </div>
        </div>
    );
}

export default App;
