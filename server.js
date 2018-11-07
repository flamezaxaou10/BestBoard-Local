const express = require("express")
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('webStore.json')
const middlewares = jsonServer.defaults()
var http = require('http')
var io = require('socket.io')
var serverIO = http.createServer(server)

io = io(serverIO)
io.on('connection', client => {
  console.log('user connected')
  // เมื่อ Client ตัดการเชื่อมต่อ
  client.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.use(
  jsonServer.rewriter({
    '/widget/board/:id': '/widget/?boardId=:id'
  })
)

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  var path = req.path.split('/')
  if (req.method === 'POST') {
    req.body._id = Date.now()
    req.body.id = Date.now()
    io.emit('update-' + path[1], 'new')
  } else if (req.method === 'PUT') {
    req.body._id = path[2]
    io.emit('update-' + path[1], 'update')
  } else if (req.method === 'DELETE') {
    io.emit('update-' + path[1], 'delete')
  }
  // Continue to JSON Server router
  next()
})


const port = process.env.PORT || 5000
server.use(router)


serverIO.listen(port, () => {
  console.log('JSON Server is running ' + port)
})
