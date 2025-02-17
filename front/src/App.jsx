import { useState, useEffect } from "react";

function App() {
    const [query, setQuery] = useState("");  // สำหรับเก็บคำค้นหาของผู้ใช้
    const [results, setResults] = useState([]);  // สำหรับเก็บผลลัพธ์
    const [suggestions, setSuggestions] = useState([]);  // สำหรับเก็บคำแนะนำ

    const handleSearch = async () => {
        if (query.trim() === "") return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/search?query=${query}`);
            const data = await res.json();
            setResults(data.results || []);  // ตั้งค่าผลลัพธ์การค้นหา
            setSuggestions(data.suggestions || []);  // ตั้งค่าคำแนะนำ
        } catch (error) {
            console.error("Error fetching data:", error);
            setResults([]);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]);  // หากคำค้นหาว่างให้เคลียร์คำแนะนำ
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();  // เรียก handleSearch เมื่อผู้ใช้หยุดพิมพ์
        }, 500); // รอ 500ms หลังจากหยุดพิมพ์

        return () => clearTimeout(timer);  // ล้าง timeout เมื่อมีการพิมพ์ใหม่
    }, [query]);  // เมื่อ query เปลี่ยนแปลงให้เรียก useEffect ใหม่

    return (
        <div className="search-container">
            <h1>โปรดใส่ชื่อจังหวัด</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)} // เก็บข้อมูลที่พิมพ์
                placeholder="พิมพ์ชื่อจังหวัดตรงนี้"
            />
            <button onClick={handleSearch}>ค้นหา</button>

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

            {/* แสดงคำแนะนำในระหว่างการพิมพ์ */}
            {suggestions.length > 0 && query && (
                <div>
                    <h3>คำแนะนำที่ใกล้เคียง:</h3>
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
