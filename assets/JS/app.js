const cl = console.log;

const todoForm = document.getElementById("todoForm");
const title = document.getElementById("title");
const completed = document.getElementById("completed");
const userId = document.getElementById("userId");
const addButton = document.getElementById("addButton");
const updateButton = document.getElementById("updateButton");
const cardContaier = document.getElementById("cardContaier");

let baseURL = "https://jsonplaceholder.typicode.com";

let TodoArr = [];
const spinner = document.getElementById("spinner");

function snackbar(msg, icon) {
  swal.fire({
    title: msg,
    icon: icon,
    timer: 2000,
  });
}

function makeApiCall(method, apiUrl, body = null, successCF, errorCF) {
  spinner.classList.remove("d-none");

  body = body ? JSON.stringify(body) : null;
  let xhr = new XMLHttpRequest();
  xhr.open(method, apiUrl);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.send(body);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status <= 299) {
      let res = JSON.parse(xhr.response);
      if (method === "GET") {
        successCF(res);
      } else if (method === "POST") {
        let obj = { ...JSON.parse(body), id: res.id };
        successCF(obj);
      } else if (method === "PATCH") {
        successCF(JSON.parse(body));
      } else {
        successCF();
      }
      spinner.classList.add("d-none");
    } else {
      snackbar("Something wents wgorng...");
    }
  };
}

makeApiCall("GET", `${baseURL}/todos`, null, creatPost, snackbar);

function creatPost(arr) {
  let result = "";
  arr.forEach((ele) => {
    result += `
    <div class = "col-md-4 mt-4"  id="${ele.id}">
          <div class="card shadow">
            <div class="card-header  text-center text-light">
              <h2>${ele.userId}</h2>
            </div>
            <div class="card-body ">
              <p class="bg-light  text-center">${ele.completed}</p>
              <p class="bg-light text-center">${ele.title}</p>
            </div>
            <div class="card-footer d-flex justify-content-between" >
            <button class="btn   border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
            <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
        </div>
          </div>
          </div>
    `;
  });
  cardContaier.innerHTML = result;
}

function onEventHandalar(ele) {
  ele.preventDefault();

  let newObj = {
    title: title.value,
    completed: completed.value,
    userId: userId.value,
  };

  let postUrl = `${baseURL}/todos`;
  makeApiCall("POST", postUrl, newObj, creatSinglecart, snackbar);
}

function creatSinglecart(newObj) {
  let div = document.createElement("div");
  div.className = "col-md-4 mt-4";
  div.id = newObj.id;

  div.innerHTML = `
  <div class="card shadow">
  <div class="card-header  text-center text-light">
    <h2>${newObj.userId}</h2>
  </div>
  <div class="card-body ">
    <p class="bg-light  text-center">${newObj.completed}</p>
    <p class="bg-light text-center">${newObj.title}</p>
  </div>
  <div class="card-footer d-flex justify-content-between" >
  <button class="btn   border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
  <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
</div>
</div>
  `;
  cardContaier.prepend(div);

  snackbar(`New todo add with id ${newObj.id} successfully..`);
}

function onEdit(ele) {
  let editId = ele.closest(".col-md-4").id;
  localStorage.setItem("editId", editId);

  let editUrl = `${baseURL}/todos/${editId}`;

  makeApiCall("GET", editUrl, null, patchdata, snackbar);
}

function patchdata(res) {
  let editObj = res;

  title.value = editObj.title;
  completed.value = editObj.completed;
  userId.value = editObj.userId;

  addButton.classList.add("d-none");
  updateButton.classList.remove("d-none");

  todoForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function updateCard(body) {
  let updateId = localStorage.getItem("editId");

  let updateObj = {
    title: title.value,
    completed: completed.value,
    userId: userId.value,
  };

  let updateUrl = `${baseURL}/todos/${updateId}`;

  makeApiCall("PATCH", updateUrl, updateObj, changeUi, snackbar);
  snackbar(`Todo update with id ${updateId} successfully..`);
}

function changeUi(body) {
  let updateId = localStorage.getItem("editId");
  let div = document.getElementById(updateId);
  div.className = "col-md-4 mt-4";
  div.innerHTML = `
  <div class="card shadow">
  <div class="card-header  text-center text-light">
    <h2>${body.userId}</h2>
  </div>
  <div class="card-body ">
    <p class="bg-light  text-center">${body.completed}</p>
    <p class="bg-light text-center">${body.title}</p>
  </div>
  <div class="card-footer d-flex justify-content-between" >
  <button class="btn   border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
  <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
</div>
</div>
  `;

  addButton.classList.remove("d-none");
  updateButton.classList.add("d-none");

  todoForm.reset();

  div.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onDelete(ele) {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete it!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let deleteId = ele.closest(".col-md-4").id;
      localStorage.setItem("deleteId", deleteId);
      let deleteUrl = `${baseURL}/todos/${deleteId}`;

      makeApiCall("DELETE", deleteUrl, null, removeCard, snackbar);
      snackbar(`Todo delete with id ${deleteId} successfully..`);
    }
  });
}

function removeCard() {
  let deleteId = localStorage.getItem("deleteId");
  document.getElementById(deleteId).remove();
}

todoForm.addEventListener("submit", onEventHandalar);

updateButton.addEventListener("click", updateCard);
