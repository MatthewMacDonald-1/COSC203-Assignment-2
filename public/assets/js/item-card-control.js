
const edit_bird = (event) => {
    event.preventDefault();
    const id = parseInt(event.srcElement.getAttribute('birdid'));
    window.location.href = "/birds/"+id+"/update"; // redirect to the birds update page
};

const delete_bird = (event) => {
    event.preventDefault();
    const id = parseInt(event.srcElement.getAttribute('birdid'));
    console.log('delete bird '+id);
    if (confirm("Are you sure you want to delete this entry?")) {
        // delete
        console.log('/birds/' + id + '/delete')
        fetch('/birds/' + id + '/delete', {
            method: 'DELETE'
        }).then((resp) => {
            if (resp.status == 204) {
                location.href = '/'
            }
        });
      } else {
        // do nothing as they didn't delete the bird
      }
};

function createEventListeners() {
    const bird_edit_buttons = document.getElementsByClassName('bird-edit-button');
    for (let i = 0; i < bird_edit_buttons.length; i++) {
        bird_edit_buttons[i].removeEventListener('click', edit_bird);
        bird_edit_buttons[i].addEventListener('click', edit_bird);
    }

    const bird_delete_buttons = document.getElementsByClassName('bird-delete-button');
    for (let i = 0; i < bird_edit_buttons.length; i++) {
        bird_delete_buttons[i].removeEventListener('click', delete_bird);
        bird_delete_buttons[i].addEventListener('click', delete_bird);
    }
}
createEventListeners();
