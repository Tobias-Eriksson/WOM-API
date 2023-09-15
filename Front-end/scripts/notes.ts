const notesDiv = <HTMLElement>document.getElementById("notesDiv")
const boardsDiv = document.getElementById("boards")
const newNoteBtn = document.getElementById("newNoteBtn");

function updateNote(noteText: string, id: string) {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('X-Custom-Header', 'CustomValue')

    const patchData = {
        text: noteText
    }
    const request: RequestInfo = new Request('http://localhost:3000/notes/' + id, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(patchData)
    })
    return fetch(request)
}

function newNote() {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('X-Custom-Header', 'CustomValue')

    const postData = {
        text: 'Placeholder',
    };

    const request: RequestInfo = new Request('http://localhost:3000/notes', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData)
    })
    window.location.reload();
    return fetch(request)

}

interface Notes<T> {
    msg: string
    reqBody: T[];
}
interface reqBody {
    id: string,
    noteText: string
}
function getNotes(): Promise<Notes<reqBody>> {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('X-Custom-Header', 'CustomValue')

    const request: RequestInfo = new Request('http://localhost:3000/notes', {
        method: 'GET',
        headers: headers
    })

    return fetch(request)
        .then(res => res.json())
        .then(res => {
            return res as Notes<reqBody>;
        })
}

try {
    getNotes()
        .then(notes => {
            for (let i = 0; i < notes.reqBody.length; i++) {
                const note = <HTMLElement>document.createElement("blockquote")
                note.contentEditable = "true"
                note.id = "note" + i
                note.classList.add('notes', 'col-sm-2', 'm-2', 'justify-content-center');
                note.innerHTML = notes.reqBody[i].noteText
                note.oninput = function () {
                    updateNote(note.innerText.toString(), (notes.reqBody[i].id).toString())
                }
                notesDiv.appendChild(note);

            }
        })

} catch (err) {
    console.log(err)
}


if (newNoteBtn) {
    newNoteBtn.addEventListener("click", newNote);
}