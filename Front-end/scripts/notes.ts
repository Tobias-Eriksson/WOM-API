const note = document.getElementById("note");

interface Note {
    msg: string,
    reqBody: {
        id: string,
        noteText: string
    }
}

interface Notes {
    msg: string,
    reqBody: {
        id: string,
        noteText: string
    }
}

if (note) {

    function getNotes(): Promise<Notes> {

        const headers: Headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('Accept', 'application/json')
        headers.set('X-Custom-Header', 'CustomValue')

        const request: RequestInfo = new Request('http://localhost:3000/notes/', {
            method: 'GET',
            headers: headers
        })

        return fetch(request)
            .then(res => res.json())
            .then(res => {
                return res as Notes;
            })
    }

    function getNote(): Promise<Note> {

        const headers: Headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('Accept', 'application/json')
        headers.set('X-Custom-Header', 'CustomValue')

        const request: RequestInfo = new Request('http://localhost:3000/notes/64f9b0f2e77a64323d94b2e7', {
            method: 'GET',
            headers: headers
        })

        return fetch(request)
            .then(res => res.json())
            .then(res => {
                return res as Note;
            })

    }

    console.log(getNote())
    getNote()
        .then(notes => {
            note.innerHTML = notes.reqBody.noteText
        })
}
