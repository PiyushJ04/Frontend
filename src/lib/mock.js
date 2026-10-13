// Mock layer: swap each function for the real endpoint (see backend README). Delays stand in for LLM latency.
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export const FALLBACK=[{academic_year:'2nd year',subject:'OOP'},{academic_year:'2nd year',subject:'ADSA'},{academic_year:'1st year',subject:'OOP'}];
export const draftReference=async()=>{await wait(7000);return[
 {id:1,q:'Q1(a). Explain encapsulation with an example.',marks:8,a:'Encapsulation binds data and the methods that act on it into one class and hides state behind private members. A BankAccount keeps balance private and exposes deposit() and withdraw(), so every change passes through validation.',ev:['oop_notes.pdf p.3','syllabus.pdf p.1']},
 {id:2,q:'Q1(b). Differentiate abstraction and encapsulation.',marks:7,a:'Abstraction decides what to show: a caller sees the interface, not the steps. Encapsulation decides what to protect: fields are hidden so state changes only through methods. One is a design view, the other an access mechanism.',ev:['oop_notes.pdf p.4']},
 {id:3,q:'Q2(a). State the four pillars of OOP.',marks:7,a:'Encapsulation, abstraction, inheritance and polymorphism. Inheritance reuses a parent class; polymorphism lets one call behave differently per object type.',ev:['oop_notes.pdf p.2','syllabus.pdf p.1']}]};
export const FACTORS0=[{n:'Diagram, where the question asks for one',w:10},{n:'Presentation and structure',w:8},{n:'Legibility (OCR confidence)',w:7}];
const names=['Aarav','Diya','Kabir','Meera','Ishaan','Anaya','Rohan','Sara','Vihaan','Tara','Arjun','Nisha'];
export const STUDENTS=Array.from({length:24},(_,i)=>{const s=(i*37+11)%100;const q=[Math.round((6+s/100*9)*2)/2,Math.round((4+((s*7)%100)/100*11)*2)/2];
 return{id:i+1,name:names[i%12]+' '+String.fromCharCode(65+i),q,total:q[0]+q[1],dist:[(100-s)/100*.5,(((s*7)%100)>50?.15:.4)],f:[['Diagram',(s%3)+'/'+3],['Presentation',(s%4>1?'2/2':'1/2')]]}});
