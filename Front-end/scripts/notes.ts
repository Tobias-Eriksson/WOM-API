const notesDiv = <HTMLElement> document.getElementById("notesDiv")

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


getNotes()
    .then(notes => {
        for (let i = 0; i < notes.reqBody.length; i++) {
            const note = <HTMLElement> document.createElement("div")
            note.id = "note"+i
            note.className = "notes"
            note.innerHTML = notes.reqBody[i].noteText
            
            notesDiv.appendChild(note);

        }
    })

