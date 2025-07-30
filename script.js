import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 🔧 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBLbFv39Xu5YHXf3bUmPJemBKsF71R33o4",
  authDomain: "student-portfolio-8bfc9.firebaseapp.com",
  projectId: "student-portfolio-8bfc9",
  storageBucket: "student-portfolio-8bfc9.appspot.com",
  messagingSenderId: "545594631981",
  appId: "1:545594631981:web:0774d711b74651ceeb95a4",
  measurementId: "G-5H279MXZ24"
};

const adminEmail = "deepaksiwag7@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM References
const statusEl = document.getElementById("auth-status");
const lostForm = document.getElementById("lostForm");
const loginWarning = document.getElementById("loginWarning");
const lostList = document.getElementById("lostItemsList");
const adminPanel = document.getElementById("adminPanel");
const adminLostList = document.getElementById("adminLostList");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackInput = document.getElementById("feedbackInput");
const notesForm = document.getElementById("notesForm");
const notesList = document.getElementById("notesList");

// Auth
window.signup = async () => {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Signed up successfully!");
  } catch (err) {
    alert(err.message);
  }
};

window.login = async () => {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Logged in successfully!");
  } catch (err) {
    alert(err.message);
  }
};

window.logout = async () => {
  await signOut(auth);
  alert("Logged out.");
};

onAuthStateChanged(auth, async user => {
  statusEl.textContent = user ? `Logged in as ${user.email}` : "Not logged in";
  if (user) {
    lostForm.classList.remove("hide");
    loginWarning?.classList.add("hide");
    await loadLostItems();
    if (user.email === adminEmail) await loadAdminPanel();
    else adminPanel?.classList.add("hide");
  } else {
    lostForm?.classList.add("hide");
    loginWarning?.classList.remove("hide");
    adminPanel?.classList.add("hide");
    lostList.innerHTML = "";
  }
});

// Lost Form
lostForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const item = document.getElementById("item").value;
  const contact = document.getElementById("contact").value;
  const date = document.getElementById("date").value;

  await addDoc(collection(db, "lost_items"), {
    name, item, contact, date,
    createdAt: serverTimestamp(),
    by: auth.currentUser.email
  });

  lostForm.reset();
  alert("Lost item submitted!");
  await loadLostItems();
  if (auth.currentUser.email === adminEmail) await loadAdminPanel();
});

// Load Lost Items
async function loadLostItems() {
  lostList.innerHTML = "";
  const snap = await getDocs(collection(db, "lost_items"));
  snap.forEach(docSnap => {
    const d = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${d.item} (by ${d.name} on ${d.date}) – Contact: ${d.contact}`;
    lostList.appendChild(li);
  });
}

// Admin Panel
async function loadAdminPanel() {
  adminLostList.innerHTML = "";
  const snap = await getDocs(collection(db, "lost_items"));
  snap.forEach(docSnap => {
    const d = docSnap.data();
    const id = docSnap.id;
    const li = document.createElement("li");
    li.innerHTML = `<b>${d.item}</b> (by ${d.name}) - ${d.date} 
      <button onclick="deleteItem('${id}')">🗑️ Delete</button>`;
    adminLostList.appendChild(li);
  });
  adminPanel.classList.remove("hide");
}

window.deleteItem = async (id) => {
  await deleteDoc(doc(db, "lost_items", id));
  await loadLostItems();
  await loadAdminPanel();
  alert("Deleted successfully.");
};

// Feedback
feedbackForm?.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "feedback"), {
    text: feedbackInput.value,
    by: auth.currentUser?.email || "anonymous",
    createdAt: serverTimestamp()
  });
  feedbackForm.reset();
  alert("Feedback submitted!");
});

// Notes
notesForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("noteTitle").value;
  const link = document.getElementById("noteLink").value;
  await addDoc(collection(db, "notes"), {
    title, link,
    createdAt: serverTimestamp(),
    by: auth.currentUser?.email || "anonymous"
  });
  notesForm.reset();
  await loadNotes();
});

async function loadNotes() {
  notesList.innerHTML = "";
  const snap = await getDocs(collection(db, "notes"));
  snap.forEach(docSnap => {
    const d = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `<a href="${d.link}" target="_blank">${d.title}</a>`;
    notesList.appendChild(li);
  });
}

loadNotes();
