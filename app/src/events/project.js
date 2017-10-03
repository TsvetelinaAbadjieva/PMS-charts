document.getElementById('saveTask').addEventListener('click', addNewTask);

document.getElementById('taskTitleInput').addEventListener('change', fieldValidate);
document.getElementById('taskDescriptionInput').addEventListener('change', fieldValidate);
document.getElementById('taskDueDateInput').addEventListener('change', fieldValidate);

function addNewTask() {

  var taskTitle = document.getElementById('taskTitleInput').value;
  var taskDescription = document.getElementById('taskDescriptionInput').value;
  var taskDueDate = document.getElementById('taskDueDateInput').value;
  var projectId = taskProjectId;
  var sectionId = taskSectionId || 0;
  var taskTemplate = null;
  var alert = document.getElementById('alertInsertTask');

  if (newTaskOpenBtn == 'newTaskOpen') {
    taskTemplate = document.getElementById('sectionDefault').querySelector('#cardDefault');
    taskTemplate.setAttribute('data_project_id', document.getElementById('sectionDefault').getAttribute('data_project_id'));
    taskTemplate.setAttribute('data_section_id', document.getElementById('sectionDefault').getAttribute('data_section_id'));
    sectionId = document.getElementById('sectionDefault').getAttribute('data_section_id');
  }
  else {
    taskTemplate = document.getElementById('section_id_' + sectionId).querySelector('#cardDefault');
  }

  var newTask = document.createElement('li');
  newTask = taskTemplate.cloneNode(true);
  var _document = document;

  if (flagValidation) {
    taskTitle = escapeString(taskTitle);
    taskDescription = escapeString(taskDescription);

    var reqObj = {
      projectId: projectId,
      sectionId: sectionId,
      task: taskTitle,
      statusId: 1,
      description: taskDescription,
      startDate: getToday(),
      dueDate: taskDueDate
    };

    url = BASE_URL + '/task';
    var headerConfig = {
      "Content-type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem('token')
    };

    callAjax('POST', url, headerConfig, reqObj, function (data) {

      alert.classList.remove('alert-danger');

      if (data.data > 0) {
        console.log(data.data)

        alert.classList.add('alert-success');
        alertMessage(alert, data.message);
        newTask.id = 'taskTitle_' + data.data;
        newTask.setAttribute('data_project_id', projectId);
        newTask.setAttribute('data_section_id', sectionId);

        newTask.querySelector('#taskTitle').id = 'taskTitle_' + data.data;
        newTask.querySelector('#taskTitle_' + data.data).setAttribute('data_task_id', data.data);
        newTask.querySelector('#taskTitle_' + data.data).innerText = taskTitle;
        newTask.querySelector('#taskTitle_' + data.data).style.display = 'block';

        newTask.querySelector('#taskDescription').id = 'taskDescription_' + data.data;
        newTask.querySelector('#taskDescription_' + data.data).setAttribute('data_task_id', data.data);
        newTask.querySelector('#taskDescription_' + data.data).innerText = taskDescription;
        newTask.querySelector('#taskDescription_' + data.data).style.display = 'block';

        newTask.querySelector('#viewTaskOpen').id = 'viewTaskOpen_' + data.data;
        newTask.querySelector('#viewTaskOpen_' + data.data).addEventListener('click', fieldValidate);

        newTask.querySelector('#btnStatus').id = 'btnStatus_' + data.data;
        newTask.querySelector('#btnStatus_' + data.data).setAttribute('data_task_id', data.data);
        // newTask.querySelector('#btnStatus_' + taskId).style.backgroundColor = 'red';
        newTask.querySelector('#btnStatus_' + data.data).innerHTML = 'TO DO';

        newTask.id = 'cardDefault_' + data.data;
        newTask.setAttribute('data_task_id', data.data);
        newTask.style.display = 'block';

        var sibling = null;
        console.log(newTask);
        if (newTaskBtn.id.indexOf('_') !== -1) {
          sibling = _document.getElementById('section_id_' + sectionId).querySelector('#cardDefault');
        }
        else if (newTaskBtn.id.indexOf('_') === -1) {
          sibling = _document.getElementById('sectionDefault').querySelector('#cardDefault');
        }
        var parent = sibling.parenNode;

        sibling.parentNode.insertBefore(newTask, sibling.nextSibling.nextSibling.nextSibling);
      }

    });
  }
  else {
    alertMessage(alert, 'Please, enter a valid input data');
  }
};

document.getElementById('editTask').addEventListener('click', function () {

  document.getElementById('editTaskArea').style.display = 'block';
  var projectId = this.getAttribute('data_project_id');
  var selectChangeResponsible = document.getElementById('responsibleUserChange');
  console.log(selectChangeResponsible);

  addResponsible(projectId, document, selectChangeResponsible);
});

document.getElementById('sendTaskComment').addEventListener('click', function () {

  var chatForm = document.getElementById('taskCommentsPrim');
  var cloneChat = document.createElement('div');
  var _document = document;

  cloneChat = chatForm.cloneNode(true);
  cloneChat.id = 'taskComments';
  cloneChat.querySelector('#taskCommentByPrim').id = 'taskCommentBy';
  cloneChat.querySelector('#taskCommentIdPrim').id = 'taskCommentId';
  console.log(cloneChat)
  cloneChat.style.display = 'block';

  var message = document.getElementById('taskComment').value;
  var msgObj = {
    comment: message,
    taskId: this.getAttribute('data_task_id'),
    //sectionId: this.getAttribute('data_section_id'),
    projectId: this.getAttribute('data_project_id')
  }
  cloneChat.querySelector('#taskCommentBy').innerText = 'Commented by: ' + localStorage.getItem('user');
  cloneChat.querySelector('#taskCommentId').value = message;

  document.getElementById('allTaskComments').appendChild(cloneChat);
  document.getElementById('taskCommentsPrim').style.display = 'none';

  var headerConfig = {
    "Content-type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem('token')
  };
  var url = BASE_URL + '/task/comment';

  if (message != '') {
    callAjax('POST', url, headerConfig, msgObj, function (data) {
      console.log(data.message);
      _document.getElementById('taskComment').value = '';
    });
  }
});


document.getElementById('sendComment').addEventListener('click', function () {

  var message = document.getElementById('comment').value;
  var messageObj = {
    user: localStorage.getItem('user'),
    message: message
  }
  var messageStr = JSON.stringify(messageObj);
  socket.emit('message', messageStr);
  document.getElementById('comment').value = '';
});

// socket.on('chat message', function(msg){

//   this.printMessage(JSON.parse(msg));
//   var chatForm = document.getElementById('chat');
//   var cloneChat = document.createElement('div');

//   cloneChat = chatForm.cloneNode();
//   cloneChat.querySelector('label').innerText = 'Commented by: user';
//   cloneChat.querySelector('input').innerText = msg;
//   document.getElementById('chat').appendChild(cloneChat);

// });

socket.on('message', (msg) => {

  var chatForm = document.getElementById('chat');
  var cloneChat = document.createElement('div');

  cloneChat = chatForm.cloneNode(true);
  cloneChat.style.display = 'block';
  var msgObj = JSON.parse(msg);
  console.log(msg);
  cloneChat.querySelector('#commentBy').innerText = 'Commented by: ' + msgObj.user;
  cloneChat.querySelector('#commentId').value = msgObj.message;
  document.getElementById('allChatComments').appendChild(cloneChat);
  chatForm.style.display = 'none';


});
