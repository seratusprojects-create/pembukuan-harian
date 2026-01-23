const list = document.getElementById("list");
let data = JSON.parse(localStorage.getItem("finance")) || [];

function render() {
  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.type === "income" ? "➕" : "➖"} ${item.desc} - Rp${item.amount}`;
    list.appendChild(li);
  });
}

function addData() {
  const desc = document.getElementById("desc").value;
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;

  if (!desc || !amount) return;

  data.push({ desc, amount, type });
  localStorage.setItem("finance", JSON.stringify(data));
  render();
}

render();
