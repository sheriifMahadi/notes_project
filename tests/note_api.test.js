const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')

const api = supertest(app)

describe('', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.notes)
  })

  describe('testing with some notes in db', () => {

    test('notes are returned as json', async () => {
      await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  
    test('all notes are returned', async () => {
      const response = await api.get('/api/notes')
    
      expect(response.body).toHaveLength(helper.notes.length)
    })
  
    test('there are two notes', async () => {
      const response = await api.get('/api/notes')
      expect(response.body).toHaveLength(2)
    })
  
    test('fetching the first note', async () => {
      const response = await api.get('/api/notes')
      const labels = response.body.map(r => r.label)
      expect(labels).toContain('A tale of iron and blood')
    })
  
  })


  describe('adding notes', () => {
    test('a valid note can be added', async () => {
      const newNote = {
        label: 'A tale of wind and fire',
        content: 'This is the content of a tale of wind and fire',
      }
      
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const notesAtEnd = await helper.notesInDb()
      expect(notesAtEnd).toHaveLength(helper.notes.length + 1)
      
      const contents = notesAtEnd.map(n => n.label)
      expect(contents).toContain(
        'A tale of wind and fire'
      )
    })
      
    test('note without content or label is not added', async () => {
      const newNote = {
        content: 'note without label'
      }
        
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400) 
      const notesAtEnd = await helper.notesInDb()
        
      expect(notesAtEnd).toHaveLength(helper.notes.length)
    })
        
  })
  describe('viewing a specific note', () => {
    test('a specific note can be viewed', async () => {
      const notesAtStart = await helper.notesInDb()
        
      const noteToView = notesAtStart[0]
        
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        
      const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
        
      expect(resultNote.body).toEqual(processedNoteToView)
    })
  
    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      console.log(validNonexistingId)

      await api
        .get(`/api/notes/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400)
    })
  })

  describe('deletion of a note', () => {
    test('a note can be deleted', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]
        
      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)
        
      const notesAtEnd = await helper.notesInDb()
        
      expect(notesAtEnd).toHaveLength(
        helper.notes.length - 1
      )
        
      const contents = notesAtEnd.map(r => r.content)
        
      expect(contents).not.toContain(noteToDelete.content)
    })
  })
})
afterAll(() => {
  mongoose.connection.close()
})

