import express from 'express'
import { LLMService } from './services/LLMService'
import { pipeline } from 'node:stream'

const llmService = new LLMService()

const app = express()
app.get('/greetings', (_, response) => {
  response.json({
    message: "hello world!"
  })
})


app.get('/translate', async (request, response) => {
  const { sentence }  = request.query
  if (!sentence) {
    response.json({message: "Missing sentence to translate"})
    return
  }
  console.log(`Translating sentence to english: ${sentence}`)
  const stream = await llmService.translateSentence(sentence.toString())
  if (response.writable) {
    pipeline(stream, response, () => {
      response.end()
    }) 
  } else {
    response.json({message: "Stream not writable"})
  }
  
})


app.listen(8080, () => {
  console.log("server running at 8080")
})