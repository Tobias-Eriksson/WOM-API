const notesDiv = <HTMLElement>document.getElementById("notesDiv")
const boardsDiv = document.getElementById("boards")
const newNoteBtn = document.getElementById("newNoteBtn")
const deleteBtns = document.getElementsByClassName("xButton")

//Ny note knapp eventlistener
if (newNoteBtn) {
    newNoteBtn.addEventListener("click", newNote);
}

//Uppdaterar note texten
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

//Gör en ny note
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

//Interfaces som behövs till vad getNotes() kan förvänta sig av response struktern
//https://www.sohamkamani.com/typescript/rest-http-api-call/
interface Notes<T> {
    msg: string
    reqBody: T[];
}
interface reqBody {
    id: string,
    noteText: string
}

//Get alla notes
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

//Remove en note med id
function removeNote(id: string, event: MouseEvent) {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('X-Custom-Header', 'CustomValue')

    const request: RequestInfo = new Request('http://localhost:3000/notes/' + id, {
        method: 'DELETE',
        headers: headers
    })
    window.location.reload();
    return fetch(request)
}

//Hämtar alla notes med getNotes() och formaterar dom till enskillda notes
//HTML Strukturen blir notesDiv>note>noteText,xButton
//Grid strukturen är gjort med bootstrap classes t.ex col-sm-10
function displayNotes() {
    try {
        getNotes()
            .then(notes => {
                for (let i = 0; i < notes.reqBody.length; i++) {
                    const note = <HTMLElement>document.createElement("div")
                    note.classList.add('notes', 'col-sm-2', 'm-2', 'justify-content-center');
                    note.setAttribute('id', (notes.reqBody[i].id).toString())

                    const noteText = <HTMLElement>document.createElement("blockquote")
                    noteText.contentEditable = "true"
                    noteText.id = "note" + i
                    noteText.classList.add('notesText', 'col-sm-10', 'justify-content-center');
                    noteText.innerHTML = notes.reqBody[i].noteText
                    noteText.setAttribute('id', (notes.reqBody[i].id).toString())
                    noteText.oninput = function () {
                        updateNote(noteText.innerText.toString(), (notes.reqBody[i].id).toString())
                    }

                    const xButton = <HTMLElement>document.createElement("button")
                    xButton.id = "xButton" + i
                    xButton.classList.add('xButton', 'btn-close', 'col-sm-1')
                    xButton.setAttribute('id', (notes.reqBody[i].id).toString())

                    xButton.addEventListener('click', (event) => {
                        removeNote(xButton.id, event);
                    })

                    note.appendChild(noteText)
                    note.appendChild(xButton)
                    notesDiv.appendChild(note)
                }
            })

    } catch (err) {
        console.log(err)
    }
}

//Ladda in alla notes
displayNotes()
