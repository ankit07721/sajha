// Frontend/src/components/PlatefulChat.tsx
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext"; // ✅ YOUR cart hook

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: RAG KNOWLEDGE BASE
// Research-backed nutrient data (PubMed, USDA, snapcalorie.com, Wikipedia)
// ─────────────────────────────────────────────────────────────────────────────
interface DishKB {
  id: string;
  name: string;
  price: number;
  category: "veg" | "non-veg" | "dessert" | "beverage";
  subCategory: string;
  spiceLevel: "mild" | "medium" | "hot" | "extra-hot";
  prepTime: number;
  keywords: string[];
  nutrients: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number };
  nutrientSource: string;
  tags: string[];
  mealTime: string[];
}

const KB: DishKB[] = [
  { id: "aloo-sel", name: "Aloo Tarkari with Sel Roti", price: 100, category: "veg", subCategory: "Breakfast", spiceLevel: "mild", prepTime: 15, keywords: ["sel roti","aloo","potato","breakfast","traditional","festive","selroti","आलु","सेल"], nutrients: { calories: 470, protein: 8, carbs: 80, fat: 14, fiber: 4, sodium: 380 }, nutrientSource: "Wikipedia Sel Roti (534kcal/100g) + USDA potato curry", tags: ["traditional","breakfast","festive"], mealTime: ["breakfast"] },
  { id: "pakora", name: "Pyaaz ko Pakora", price: 50, category: "veg", subCategory: "Snacks", spiceLevel: "medium", prepTime: 15, keywords: ["pakora","pakoda","pyaaz","onion","snack","fritter","पकौडा"], nutrients: { calories: 320, protein: 9, carbs: 33, fat: 18, fiber: 4, sodium: 420 }, nutrientSource: "USDA besan deep-fry absorption estimate", tags: ["crispy","snack","rainy-day"], mealTime: ["snack"] },
  { id: "samosa", name: "Samosa (2 pcs)", price: 48, category: "veg", subCategory: "Snacks", spiceLevel: "mild", prepTime: 10, keywords: ["samosa","snack","crispy","pocket","समोसा"], nutrients: { calories: 290, protein: 5, carbs: 36, fat: 14, fiber: 3, sodium: 310 }, nutrientSource: "USDA ~145kcal/piece × 2", tags: ["crispy","budget","snack"], mealTime: ["snack"] },
  { id: "veg-thali", name: "Veg Thali", price: 150, category: "veg", subCategory: "Nepali Mains", spiceLevel: "mild", prepTime: 15, keywords: ["veg thali","dal bhat","thali","nepali","rice","dal","भात","थाली","दाल"], nutrients: { calories: 520, protein: 16, carbs: 82, fat: 12, fiber: 9, sodium: 520 }, nutrientSource: "snapcalorie.com Nepali Thali 384kcal/240g scaled", tags: ["balanced","traditional","filling"], mealTime: ["lunch","dinner"] },
  { id: "chicken-thali", name: "Chicken Thali", price: 250, category: "non-veg", subCategory: "Nepali Mains", spiceLevel: "medium", prepTime: 30, keywords: ["chicken thali","chicken","thali","चिकन","थाली"], nutrients: { calories: 680, protein: 38, carbs: 68, fat: 22, fiber: 6, sodium: 740 }, nutrientSource: "snapcalorie.com Chicken Thali 346.7kcal/240g scaled", tags: ["protein-rich","filling","non-veg"], mealTime: ["lunch","dinner"] },
  { id: "veg-dhido", name: "Dhido Set Veg", price: 200, category: "veg", subCategory: "Nepali Mains", spiceLevel: "mild", prepTime: 25, keywords: ["dhido","buckwheat","millet","gluten free","diabetic","healthy","ढिडो"], nutrients: { calories: 420, protein: 14, carbs: 68, fat: 8, fiber: 10, sodium: 290 }, nutrientSource: "PubMed 2020 NCBI #32964015 dhido analysis", tags: ["healthy","high-fiber","anti-diabetic"], mealTime: ["lunch","dinner"] },
  { id: "chicken-dhido", name: "Chicken Dhido Set", price: 249, category: "non-veg", subCategory: "Nepali Mains", spiceLevel: "medium", prepTime: 30, keywords: ["chicken dhido","dhido chicken","चिकन ढिडो"], nutrients: { calories: 580, protein: 40, carbs: 62, fat: 18, fiber: 8, sodium: 640 }, nutrientSource: "PubMed 2020 dhido base + USDA chicken 31g/100g", tags: ["protein-rich","filling","high-fiber"], mealTime: ["lunch","dinner"] },
  { id: "buff-momo", name: "Buff Jhol Momo", price: 140, category: "non-veg", subCategory: "Momo & Dumplings", spiceLevel: "medium", prepTime: 20, keywords: ["buff momo","jhol momo","momo","dumpling","buff","मम","मोमो"], nutrients: { calories: 310, protein: 18, carbs: 35, fat: 10, fiber: 3, sodium: 580 }, nutrientSource: "snapcalorie.com Buff Momo 250kcal/150g + jhol soup ~60kcal", tags: ["popular","street-food","soupy"], mealTime: ["snack","lunch","dinner"] },
  { id: "veg-momo", name: "Veg Momo", price: 57, category: "veg", subCategory: "Momo & Dumplings", spiceLevel: "mild", prepTime: 15, keywords: ["veg momo","vegetarian momo","momo","dumpling","भेज मम"], nutrients: { calories: 240, protein: 8, carbs: 40, fat: 4, fiber: 3, sodium: 320 }, nutrientSource: "snapcalorie.com 120kcal/100g + tarladalal.com 35kcal/piece × 8", tags: ["light","budget","popular"], mealTime: ["snack","lunch"] },
  { id: "chowmein", name: "Chicken Chowmein", price: 200, category: "non-veg", subCategory: "Noodles", spiceLevel: "medium", prepTime: 15, keywords: ["chowmein","noodles","chicken noodles","stir fry","चाउमिन"], nutrients: { calories: 520, protein: 28, carbs: 62, fat: 16, fiber: 3, sodium: 680 }, nutrientSource: "USDA stir-fried noodles + chicken data", tags: ["quick","popular","street-food"], mealTime: ["lunch","snack","dinner"] },
  { id: "wai-wai", name: "Wai Wai Sadheko", price: 100, category: "veg", subCategory: "Noodles", spiceLevel: "hot", prepTime: 10, keywords: ["wai wai","instant noodles","sadheko","spicy noodles","वाईवाई"], nutrients: { calories: 400, protein: 9, carbs: 52, fat: 17, fiber: 2, sodium: 820 }, nutrientSource: "Wai Wai product label 75g pack + sadheko additions", tags: ["spicy","quick","budget","crunchy"], mealTime: ["snack","anytime"] },
  { id: "sandwich", name: "Grilled Paneer Sandwich", price: 180, category: "veg", subCategory: "Burgers & Sandwiches", spiceLevel: "mild", prepTime: 10, keywords: ["sandwich","paneer","grilled","bread","स्यान्डविच"], nutrients: { calories: 390, protein: 18, carbs: 38, fat: 18, fiber: 4, sodium: 480 }, nutrientSource: "USDA bread 80kcal/slice × 2 + paneer 265kcal/100g × 60g", tags: ["modern","grilled","filling"], mealTime: ["breakfast","snack","lunch"] },
  { id: "yomari", name: "Yomari", price: 80, category: "dessert", subCategory: "Desserts", spiceLevel: "mild", prepTime: 20, keywords: ["yomari","newari","sweet","rice flour","dessert","योमरी"], nutrients: { calories: 280, protein: 5, carbs: 55, fat: 5, fiber: 2, sodium: 40 }, nutrientSource: "USDA rice flour + chaku molasses + century.com.np", tags: ["Newari","festive","sweet"], mealTime: ["snack","dessert"] },
  { id: "chiya", name: "Masala Chiya", price: 40, category: "beverage", subCategory: "Beverages", spiceLevel: "mild", prepTime: 5, keywords: ["chiya","tea","masala tea","chai","beverage","drink","चिया"], nutrients: { calories: 85, protein: 3, carbs: 12, fat: 3, fiber: 0, sodium: 50 }, nutrientSource: "USDA whole milk × 0.5 + spices + sugar", tags: ["warming","energizing","budget","antioxidant"], mealTime: ["breakfast","snack","anytime"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1A: TRIE DATA STRUCTURE
// O(m) prefix lookup — m = query length
// ─────────────────────────────────────────────────────────────────────────────
class TrieNode { children = new Map<string, TrieNode>(); isEnd = false; ids: string[] = []; }

class Trie {
  root = new TrieNode();
  insert(word: string, id: string) {
    let n = this.root;
    for (const c of word.toLowerCase()) { if (!n.children.has(c)) n.children.set(c, new TrieNode()); n = n.children.get(c)!; }
    n.isEnd = true;
    if (!n.ids.includes(id)) n.ids.push(id);
  }
  search(prefix: string): string[] {
    let n = this.root;
    for (const c of prefix.toLowerCase()) { if (!n.children.has(c)) return []; n = n.children.get(c)!; }
    const res: string[] = [];
    const dfs = (node: TrieNode) => { if (node.isEnd) res.push(...node.ids); node.children.forEach(dfs); };
    dfs(n);
    return [...new Set(res)];
  }
}

const TRIE = (() => {
  const t = new Trie();
  KB.forEach(d => { d.keywords.forEach(kw => { kw.split(" ").forEach(w => t.insert(w, d.id)); t.insert(kw.replace(/\s/g, ""), d.id); }); });
  return t;
})();

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1B: WEIGHTED INTENT SCORING
// ─────────────────────────────────────────────────────────────────────────────
type Intent = "GREETING"|"MENU"|"NUTRITION"|"DISH"|"BUDGET"|"RECOMMEND"|"ADD_CART"|"SPICE"|"VEG"|"NONVEG"|"PROTEIN"|"LOW_CAL"|"QUICK"|"HELP"|"UNKNOWN";

const INTENTS: Record<Intent, { words: string[]; w: number }[]> = {
  GREETING:  [{ words: ["hello","hi","hey","namaste","namaskar","yo","sup"], w: 10 }],
  MENU:      [{ words: ["menu","list","food","items","what","available","show","dekhau","k xa","ke xa","sabai","have"], w: 8 }],
  NUTRITION: [{ words: ["calorie","calories","protein","carbs","fat","fiber","nutrition","nutrient","healthy","kcal","kati calorie","kati protein"], w: 10 }],
  DISH:      [{ words: ["momo","thali","dhido","chowmein","chiya","samosa","pakora","yomari","sandwich","wai wai","sel roti","buff","paneer"], w: 9 }],
  BUDGET:    [{ words: ["cheap","budget","affordable","price","cost","kati","paisa","under","below","rs","nrs"], w: 9 }],
  RECOMMEND: [{ words: ["suggest","recommend","best","popular","what should","ke khau","which","favourite","today"], w: 8 }],
  ADD_CART:  [{ words: ["add","cart","order","buy","want","take","lagau","order garne"], w: 10 }],
  SPICE:     [{ words: ["spicy","spice","mild","hot","chilli","piro","tato","not spicy"], w: 9 }],
  VEG:       [{ words: ["veg","vegetarian","vegan","plant","no meat","shakahari"], w: 10 }],
  NONVEG:    [{ words: ["non veg","nonveg","chicken","buff","meat","maasu"], w: 10 }],
  PROTEIN:   [{ words: ["protein","muscle","gym","workout","high protein","bodybuilding","protien"], w: 10 }],
  LOW_CAL:   [{ words: ["low calorie","diet","weight loss","light","slim","lose weight","fat loss"], w: 10 }],
  QUICK:     [{ words: ["quick","fast","hurry","instant","jaldi","now","asap","urgent"], w: 9 }],
  HELP:      [{ words: ["help","assist","confused","what can","commands"], w: 8 }],
  UNKNOWN:   [],
};

function detectIntent(msg: string): Intent {
  const lower = msg.toLowerCase();
  const scores: Partial<Record<Intent, number>> = {};
  (Object.keys(INTENTS) as Intent[]).forEach(intent => {
    if (intent === "UNKNOWN") return;
    let s = 0;
    INTENTS[intent].forEach(({ words, w }) => words.forEach(word => { if (lower.includes(word)) s += w; }));
    if (s > 0) scores[intent] = s;
  });
  const sorted = Object.entries(scores).sort((a, b) => (b[1] as number) - (a[1] as number));
  return sorted.length > 0 ? sorted[0][0] as Intent : "UNKNOWN";
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: RAG RETRIEVAL
// ─────────────────────────────────────────────────────────────────────────────
function ragRetrieve(query: string, topK = 3): DishKB[] {
  const scores: Record<string, number> = {};
  query.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length < 2) return;
    TRIE.search(word).forEach(id => { scores[id] = (scores[id] || 0) + 3; });
  });
  KB.forEach(d => { d.keywords.forEach(kw => { if (query.toLowerCase().includes(kw)) scores[d.id] = (scores[d.id] || 0) + 5; }); });
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, topK).map(([id]) => KB.find(d => d.id === id)!).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME AWARENESS
// ─────────────────────────────────────────────────────────────────────────────
function timeCtx() {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return { label: "Morning",    slots: ["breakfast"],     greet: "Good morning ☀️" };
  if (h >= 11 && h < 15) return { label: "Lunch time", slots: ["lunch"],         greet: "Good afternoon 🌤️" };
  if (h >= 15 && h < 18) return { label: "Evening",    slots: ["snack"],         greet: "Good evening 🌅" };
  if (h >= 18 && h < 22) return { label: "Dinner",     slots: ["dinner"],        greet: "Good evening 🌙" };
  return                         { label: "Late night", slots: ["snack","anytime"],greet: "Hey night owl 🌃" };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
interface BotResponse { text: string; dishes?: DishKB[]; }

function respond(message: string): BotResponse {
  const intent = detectIntent(message);
  const tc = timeCtx();
  const retrieved = ragRetrieve(message);

  switch (intent) {
    case "GREETING": {
      const recs = KB.filter(d => d.mealTime.some(t => tc.slots.includes(t))).slice(0, 2);
      return { text: `${tc.greet} Welcome to Plateful! 🍽️\n\nPerfect time for ${recs.map(d => d.name).join(" or ")}.\n\nHow can I help you today? Type **help** for all commands!` };
    }
    case "MENU": {
      const grouped: Record<string, DishKB[]> = {};
      KB.forEach(d => { (grouped[d.subCategory] ??= []).push(d); });
      const text = Object.entries(grouped).map(([cat, items]) =>
        `**${cat}**\n${items.map(i => `  • ${i.name} — NRs ${i.price}`).join("\n")}`
      ).join("\n\n");
      return { text: `Here's our full menu 🍽️\n\n${text}\n\nAsk me about any dish for nutrition info or to add to cart!` };
    }
    case "NUTRITION": {
      if (retrieved.length > 0) {
        const d = retrieved[0];
        return { text: `📊 **${d.name}** (NRs ${d.price})\n\n🔥 Calories: ${d.nutrients.calories} kcal\n💪 Protein: ${d.nutrients.protein}g\n🍞 Carbs: ${d.nutrients.carbs}g\n🥑 Fat: ${d.nutrients.fat}g\n🌾 Fiber: ${d.nutrients.fiber}g\n🧂 Sodium: ${d.nutrients.sodium}mg\n\n📚 Source: ${d.nutrientSource}`, dishes: [d] };
      }
      return { text: `Which dish's nutrition are you curious about?\n\nTry: "calories in momo" or "protein in chicken thali"` };
    }
    case "DISH":
    case "ADD_CART": {
      if (retrieved.length > 0) return { text: intent === "ADD_CART" ? `🛒 Which would you like to add?` : `Found these for you! 🎯`, dishes: retrieved };
      return { text: `I couldn't find that dish. Type **menu** to see all available items!` };
    }
    case "BUDGET": {
      const match = message.match(/\d+/);
      const budget = match ? parseInt(match[0]) : 100;
      const cheap = KB.filter(d => d.price <= budget).sort((a, b) => b.nutrients.calories - a.nutrients.calories);
      if (cheap.length === 0) return { text: `Nothing under NRs ${budget}. Our cheapest is Masala Chiya at NRs 40 ☕` };
      return { text: `Under NRs ${budget} 💰`, dishes: cheap.slice(0, 4) };
    }
    case "RECOMMEND": {
      const recs = KB.filter(d => d.mealTime.some(t => tc.slots.includes(t))).slice(0, 3);
      return { text: `For ${tc.label.toLowerCase()}, I recommend:`, dishes: recs.length > 0 ? recs : KB.slice(0, 3) };
    }
    case "PROTEIN": {
      const sorted = [...KB].sort((a, b) => b.nutrients.protein - a.nutrients.protein).slice(0, 3);
      return { text: `💪 Highest protein dishes:`, dishes: sorted };
    }
    case "LOW_CAL": {
      const sorted = [...KB].sort((a, b) => a.nutrients.calories - b.nutrients.calories).slice(0, 3);
      return { text: `🥦 Lowest calorie options:`, dishes: sorted };
    }
    case "QUICK": {
      const quick = KB.filter(d => d.prepTime <= 10).sort((a, b) => a.prepTime - b.prepTime);
      return { text: `⚡ Ready in 10 mins or less:`, dishes: quick };
    }
    case "VEG":   return { text: `🌿 Vegetarian options:`, dishes: KB.filter(d => d.category === "veg") };
    case "NONVEG": return { text: `🍗 Non-veg options:`, dishes: KB.filter(d => d.category === "non-veg") };
    case "SPICE": {
      const lower = message.toLowerCase();
      const lvl = lower.includes("mild") || lower.includes("not spicy") ? "mild" : lower.includes("hot") || lower.includes("piro") ? "hot" : "medium";
      return { text: `🌶️ ${lvl} options:`, dishes: KB.filter(d => lvl === "hot" ? ["hot","extra-hot"].includes(d.spiceLevel) : d.spiceLevel === lvl) };
    }
    case "HELP":
      return { text: `Here's what I can do 🤖\n\n🍽️ **menu** — see all dishes\n💰 **under NRs 100** — budget food\n💪 **best protein** — gym food\n🥦 **low calorie** — diet food\n🌿 **veg only** — vegetarian\n🍗 **non-veg** — meat dishes\n🌶️ **mild/hot food** — by spice\n⚡ **quick food** — ready fast\n📊 **calories in momo** — nutrition\n🛒 **add momo to cart** — order\n\nI understand Nepali-English mix too! 🇳🇵` };
    default:
      if (retrieved.length > 0) return { text: `Here's what I found 🔍`, dishes: retrieved };
      return { text: `Hmm, I'm not sure about that 🤔\n\nTry typing **help** to see all commands, or **menu** to browse all dishes!` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
interface Msg { id: string; role: "user"|"bot"; text: string; dishes?: DishKB[]; time: Date; }

function DishCard({ d, onAdd }: { d: DishKB; onAdd: (id: string) => void }) {
  const catColor = d.category === "veg" ? "#dcfce7|#16a34a" : d.category === "beverage" ? "#dbeafe|#1d4ed8" : d.category === "dessert" ? "#fce7f3|#be185d" : "#fee2e2|#dc2626";
  const [bg, fg] = catColor.split("|");
  const spiceColor: Record<string, string> = { mild:"#22c55e", medium:"#f59e0b", hot:"#ef4444","extra-hot":"#7c3aed" };
  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:12, padding:"10px 12px", marginBottom:8, transition:"border 0.15s" }}
      onMouseOver={e => e.currentTarget.style.borderColor="#f97316"}
      onMouseOut={e => e.currentTarget.style.borderColor="#f0f0f0"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a" }}>{d.name}</div>
          <div style={{ fontSize:10, color:"#888", marginTop:3 }}>🔥 {d.nutrients.calories}kcal · 💪 {d.nutrients.protein}g · ⏱️ {d.prepTime}min</div>
          <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap" as const }}>
            <span style={{ background:bg, color:fg, fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:99 }}>{d.category}</span>
            <span style={{ background:`${spiceColor[d.spiceLevel]}18`, color:spiceColor[d.spiceLevel], fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:99 }}>{d.spiceLevel}</span>
          </div>
        </div>
        <div style={{ textAlign:"right", marginLeft:10, flexShrink:0 }}>
          <div style={{ fontSize:14, fontWeight:900, color:"#f97316" }}>NRs {d.price}</div>
          <button onClick={() => onAdd(d.id)} style={{ marginTop:5, background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", border:"none", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg, onAdd }: { msg: Msg; onAdd: (id: string) => void }) {
  const isUser = msg.role === "user";
  const bold = (text: string) => text.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2,-2)}</strong> : part
  );
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:12 }}>
      <div style={{ maxWidth:"86%" }}>
        {!isUser && <div style={{ fontSize:9, color:"#aaa", marginBottom:3, marginLeft:2 }}>Plateful Assistant</div>}
        <div style={{ padding:"10px 14px", borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px", background:isUser?"linear-gradient(135deg,#f97316,#ea580c)":"#fff", color:isUser?"#fff":"#1a1a1a", fontSize:13, lineHeight:1.55, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:isUser?"none":"1.5px solid #f0f0f0" }}>
          {msg.text.split("\n").map((line, i) => <span key={i}>{bold(line)}<br /></span>)}
        </div>
        {msg.dishes && msg.dishes.length > 0 && (
          <div style={{ marginTop:8 }}>
            {msg.dishes.map(d => <DishCard key={d.id} d={d} onAdd={onAdd} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function PlatefulChat() {
  const { addToCart } = useCart(); // ✅ YOUR addToCart({ menuItemId, quantity })
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "w", role: "bot",
    text: `${timeCtx().greet} I'm **Plateful Assistant** 🍽️\n\nType **help** to see what I can do, or just ask me anything!`,
    time: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  // ✅ Matches YOUR addToCart signature exactly
  const handleAdd = (dishId: string) => {
    const dish = KB.find(d => d.id === dishId);
    if (!dish) return;
    // NOTE: dishId here is our local KB ID.
    // In production, map this to the real MenuItem._id from your database.
    addToCart({ menuItemId: dishId, quantity: 1 });
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { id: Date.now().toString(), role:"user", text:input, time:new Date() };
    setMsgs(p => [...p, userMsg]);
    const q = input;
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const res = respond(q);
      setMsgs(p => [...p, { id:(Date.now()+1).toString(), role:"bot", text:res.text, dishes:res.dishes, time:new Date() }]);
      setTyping(false);
    }, 500 + Math.random() * 400);
  };

  const QUICK = ["Show menu 🍽️","Best protein 💪","Under NRs 100 💰","Veg only 🌿","Quick food ⚡","Help 🤖"];

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(o => !o)} title="Plateful Assistant" style={{ position:"fixed", bottom:100, right:28, zIndex:9999, width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#1a0a00,#f97316)", border:"2px solid rgba(255,255,255,0.15)", boxShadow:"0 6px 24px rgba(249,115,22,0.45)", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", transition:"transform 0.2s" }}
        onMouseOver={e => e.currentTarget.style.transform="scale(1.1)"}
        onMouseOut={e => e.currentTarget.style.transform="scale(1)"}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{ position:"fixed", bottom:170, right:28, zIndex:9998, width:378, height:555, background:"#fafafa", borderRadius:22, boxShadow:"0 16px 64px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden", animation:"chatIn 0.28s cubic-bezier(.4,0,.2,1)" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#1a0a00,#f97316)", padding:"12px 16px", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:8, letterSpacing:2, color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>NLP · RAG · Trie Algorithm</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff", marginTop:1 }}>💬 Plateful Assistant</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#fff" }}>🟢 Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 4px" }}>
            {msgs.map(msg => <Bubble key={msg.id} msg={msg} onAdd={handleAdd} />)}
            {typing && (
              <div style={{ display:"flex", marginBottom:10 }}>
                <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"18px 18px 18px 4px", padding:"10px 16px", display:"flex", gap:5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#f97316", animation:`dot 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding:"6px 10px", display:"flex", gap:5, overflowX:"auto", flexShrink:0, borderTop:"1px solid #f0f0f0", background:"#fff" }}>
            {QUICK.map(p => (
              <button key={p} onClick={() => setInput(p.replace(/[🍽️💪💰🌿⚡🤖]/g,"").trim())} style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:99, padding:"4px 10px", fontSize:10, fontWeight:700, color:"#c2410c", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:"10px 10px", background:"#fff", borderTop:"1px solid #f0f0f0", display:"flex", gap:7, flexShrink:0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()}
              placeholder="Ask anything about our food..." style={{ flex:1, padding:"9px 13px", border:"2px solid #f0f0f0", borderRadius:11, fontSize:13, outline:"none", fontFamily:"inherit" }}
              onFocus={e => e.target.style.borderColor="#f97316"}
              onBlur={e => e.target.style.borderColor="#f0f0f0"}
            />
            <button onClick={send} style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(135deg,#f97316,#ea580c)", border:"none", color:"#fff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>➤</button>
          </div>
        </div>
      )}
      <style>{`@keyframes chatIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </>
  );
}