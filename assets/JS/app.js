const cl = console.log;

const todoForm = document.getElementById("todoForm");
const title = document.getElementById("title");
const completed = document.getElementById("completed");
const userId = document.getElementById("userId");

const cardContaier = document.getElementById("cardContaier");

const addBtnn = document.getElementById("addbt");
const updatBtn = document.getElementById("updatId");

let TodoArr = [];
let baseURl = "https://jsonplaceholder.typicode.com";

let spinner = document.getElementById("spinner");

function snackbar(msg, icon) {
  swal.fire({
    title: msg,
    icon: icon,
    timer: 2000,
  });
}

function todoStatus(status) {
  if (status) {
    return `<span class="badge bg-success">Completed</span>`;
  } else {
    return `<span class="badge bg-warning text-dark">Pending</span>`;
  }
}

function makeApicall(methodName, apiUrl, body = null, successcb, errorcb) {
  body = body ? JSON.stringify(body) : null;

  spinner.classList.remove("d-none");

  let xhr = new XMLHttpRequest();

  xhr.open(methodName, apiUrl);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.send(body);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status <= 299) {
      let res = JSON.parse(xhr.response);
      if (methodName === "GET") {
        successcb(res);
      } else if (methodName === "POST") {
        let obj = { ...JSON.parse(body), id: res.id };
        successcb(obj);
      } else if (methodName === "PUT") {
        successcb(JSON.parse(body));
      } else {
        successcb();
      }
    } else {
      snackbar("something wents wrong", "error");
    }
    spinner.classList.add("d-none");
  };
}

makeApicall("GET", `${baseURl}/todos`, null, creatposts, snackbar);

function creatposts(arr) {
  let result = "";
  arr.forEach((ele) => {
    result += `
    <div class="col-md-3 mt-3"  id="${ele.id}">
            <div class="card shadow">
              <div class="card-header  text-center text-light">
                <h2>${ele.userId}</h2>
              </div>
              <div class="card-body ">
                <p class="  text-center">${todoStatus(ele.completed)}</p>
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

function onsubmitHandalar(ele) {
  ele.preventDefault();

  let obj = {
    title: title.value,
    completed: completed.value,
    userId: userId.value,
  };

  let postUrl = `${baseURl}/todos`;

  makeApicall("POST", postUrl, obj, creatsingleCard, snackbar);
}

function creatsingleCard(obj) {
  let div = document.createElement("div");

  div.className = "col-md-3 mt-4";
  div.id = obj.id;
  div.innerHTML = `
  <div class="card shadow">
      <div class="card-header  text-center text-light">
      <h2>${obj.userId}</h2>
  </div>
    <div class="card-body ">
      <p class="  text-center">${todoStatus(obj.completed)}</p>
      <p class="bg-light text-center">${obj.title}</p>
    </div>

     <div class="card-footer d-flex justify-content-between" >
     <button class="btn   border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
      <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
     </div>
  </div>
  `;

  cardContaier.prepend(div);
  todoForm.reset();
  snackbar(`The post is added with id ${obj.id} Successfully`, "success");
}

function onEdit(ele) {
  let editId = ele.closest(".col-md-3").id;

  localStorage.setItem("editId", editId);
  let editUrl = `${baseURl}/todos/${editId}`;

  makeApicall("GET", editUrl, null, patchData, snackbar);
}

function patchData(res) {
  let editObj = res;

  todoForm.classList.remove("d-none");

  title.value = editObj.title;
  completed.value = editObj.completed;
  userId.value = editObj.userId;

  addBtnn.classList.add("d-none");
  updatBtn.classList.remove("d-none");

  todoForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onupdateHandalar() {
  let updateId = localStorage.getItem("editId");

  let updateUrl = `${baseURl}/todos/${updateId}`;

  let updObj = {
    title: title.value,
    completed: completed.value,
    userId: userId.value,
    id: updateId,
  };

  makeApicall("PUT", updateUrl, updObj, updateOnUI, snackbar);

  snackbar(`Post Updated with id ${updateId} Successfully`, "success");
}

function updateOnUI(body) {
  let updateId = localStorage.getItem("editId");
  let div = document.getElementById(updateId);
  div.className = "col-md-3 mt-4";
  div.innerHTML = `
  <div class="card shadow">
  <div class="card-header  text-center text-light" >
    <h2>${body.userId}</h2>
  </div>
  <div class="card-body ">
    <p class="  text-center">${todoStatus(body.completed)}</p>
    <p class="bg-light text-center">${body.title}</p>
  </div>
  <div class="card-footer d-flex justify-content-between" >
  <button class="btn   border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
  <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
</div>
</div>
  
  `;

  addBtnn.classList.remove("d-none");
  updatBtn.classList.add("d-none");
  todoForm.reset();

  div.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onDelete(ele) {
  let removeId = ele.closest(".col-md-3").id;

  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete it ",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2e86f2",
    cancelButtonColor: "rgb(193, 19, 19)",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem("removeId", removeId);

      let removeURL = `${baseURl}/todos/${removeId}`;

      makeApicall("DELETE", removeURL, null, onDeleteFun, snackbar);
    } else {
      snackbar("you canceled it ");
    }
  });
}

function onDeleteFun() {
  let deleteId = localStorage.getItem("removeId");
  document.getElementById(deleteId).remove();
  snackbar(`Card delete with id ${deleteId} successfully`, "success");
}

todoForm.addEventListener("submit", onsubmitHandalar);
updatBtn.addEventListener("click", onupdateHandalar);
