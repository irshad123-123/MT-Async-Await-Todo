let cl = console.log;
const todoForm = document.getElementById('todoForm')
const todoItemControler = document.getElementById('todoItem')
const addTodo = document.getElementById('addTodo')
const updateTodo = document.getElementById('updateTodo')
const todoContainer = document.getElementById('todoContainer')
const loader = document.getElementById('loader')

let Base_URL = `https://crud-35fc1-default-rtdb.asia-southeast1.firebasedatabase.app`
let Todos_URL = `${Base_URL}/todos.json`

const snackBar = (msg, icon)=>{
    Swal.fire({
        title : msg,
        icon : icon,
        timer : 1500
    })
}

let objtoArr = (obj)=>{
    let todoArr = []
    for(const key in obj){
        todoArr.unshift({...obj[key], id:key})
    }
    return todoArr
}

const todoTemplating = (arr) =>{
    let result = ``;
    arr.forEach(f=>{
        result += `<li id="${f.id}" class="list-group-item d-flex justify-content-between align-items-center">
                        <strong>${f.todoItem}</strong>
                        <div>
                        <i onclick = "onEdit(this)" class="fa-solid fa-pen-to-square text-success fa-2x" role="button"></i>
                        <i onclick = "onRemove(this)" class="fa-solid fa-trash text-danger fa-2x" role="button"></i>
                        </div>
                    </li>`
    })
    todoContainer.innerHTML = result
}

const onEdit = async(ele) =>{
    let Edit_Id = ele.closest('li').id
    localStorage.setItem('Edit_Id', Edit_Id)
    cl(Edit_Id)
    let Edit_URL = `${Base_URL}/todos/${Edit_Id}.json`
    let res = await makeApiCall('GET', Edit_URL, null)
    todoItemControler.value = res.todoItem

    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
    snackBar('TodoItem patch successfull!!!', 'success')
    
}

const onRemove = async(ele) =>{
   let res = await Swal.fire({
  title: "Are you sure?",
  text: "Are you sure want to remove this TodoItem!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
     let Remove_Id = ele.closest('li').id;
    cl(Remove_Id)
    let Remove_URL = `${Base_URL}/todos/${Remove_Id}.json`
    let res = makeApiCall('DELETE', Remove_URL, null)
    ele.closest('li').remove()
    // snackBar('TodoItem delete successfully', 'success')
  }
});

}

const makeApiCall = async (methodName, api_url, msgBody)=>{
    let msg = msgBody ? JSON.stringify(msgBody) : null;
        loader.classList.remove('d-none')
    try{
        let res = await fetch(api_url, {
        method:methodName,
        body:msg,
        headers:{
            'auth':'JWT Token form LS',
            'content-type':'application/json'
        }
    })
    if(!res.ok){
        throw new Error('Network Error')
    }
    return res.json()
    }catch{
        cl('Error')
    }finally{
        loader.classList.add('d-none')
    }
}

const makeAll = async () =>{
    let res = await makeApiCall('GET', Todos_URL, null)
    cl(res)
    let posts = objtoArr(res)
    todoTemplating(posts)
}
makeAll()

const onSubmitTodo = async (eve) =>{
    eve.preventDefault()
    let obj = {
        todoItem:todoItemControler.value
    }
    cl(obj)
    let res = await makeApiCall('POST', Todos_URL, obj)
    todoForm.reset()
    let li = document.createElement('li')
    li.className = `list-group-item d-flex justify-content-between align-items-center`
    li.id = res.name;
    li.innerHTML = `<strong>${obj.todoItem}</strong>
               <div>
               <i onclick = "onEdit(this)" class="fa-solid fa-pen-to-square text-success fa-2x" role="button"></i>
                        <i onclick = "onRemove(this)" class="fa-solid fa-trash text-danger fa-2x" role="button"></i>
               </div>         
    `
    todoContainer.prepend(li)
    snackBar('New TodoItem is added successfull!!!', 'success')
}

const onUpdateTodo = async(eve) =>{
    let Update_Id = localStorage.getItem('Edit_Id')
    let Update_URL = `${Base_URL}/todos/${Update_Id}.json`
    let Update_Obj = {
        todoItem:todoItemControler.value,
        id :Update_Id
    }
    let res = await makeApiCall('PATCH', Update_URL, Update_Obj)
    todoForm.reset()
    let li = document.getElementById(Update_Id).children
    li[0].innerHTML = res.todoItem
    addTodo.classList.remove('d-none')
    updateTodo.classList.add('d-none')
    snackBar('TodoItem is updated successfull!!!', 'success')

}

todoForm.addEventListener('submit', onSubmitTodo)
updateTodo.addEventListener('click', onUpdateTodo)