import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {placar} from '../../placar/index.js'
const prisma = new PrismaClient()

export const create = async (ctx) => {
  const password = await bcrypt.hash(ctx.request.body.password, 10)
  const data = {
    name: ctx.request.body.name,
    username: ctx.request.body.username,
    email: ctx.request.body.email,
    password
  }
//Error Handling
  try{
    const {password, ...user} = await prisma.user.create({data})
    ctx.body = user
    ctx.status = 201
  }catch (error){
    ctx.body = error
    ctx.status = 500
  }
}
export const login = async ctx => {
  const [type, token] = ctx.headers.authorization.split(" ")
  const [email, passwordPlaintext]= atob(token).split(":")
  const user = await prisma.user.findUnique({ 
    where: {email}
  })
  if(!user){
    ctx.status = 404
    return
  }
  const passwordMatch = await bcrypt.compare(passwordPlaintext, user.password)
  if(!passwordMatch){
    ctx.status = 404
    return
  }

  const {password, ...utils} = user

  const acessToken = jwt.sign({
    sub: user.id,
    name: user.name,
    expiresIn: '2d'
  }, process.env.JWT_SECRET)

  ctx.body = {
    user: utils,
    acessToken
  }
 
}
export const hunches = async ctx => {
  let pontos = 0
  const username = ctx.request.params.username

  const user = await prisma.user.findUnique({
      where: { username }
  })

  if (!user) {
      ctx.status = 404
      return
  }

  const hunches = await prisma.hunch.findMany({
      where: {
          userId: user.id
      }
  })
  let apostas = hunches
  if(apostas.length > 0){
    for(let x = 0; x < placar.length; x++ ){
      for(let y = 0; y < apostas.length; y++ ){
         if(placar[x].id == apostas[y].gameId){
          if((placar[x].homeTeam == apostas[y].homeTeamScore) && (placar[x].awayTeam == apostas[y].awayTeamScore)){
              pontos += 3
          }else{
            if(placar[x].homeTeam == apostas[y].homeTeamScore){
              pontos += 1
            }
            if(placar[x].awayTeam == apostas[y].awayTeamScore){
              pontos += 1
            }
          }
          }
      }
  }
  }
  await prisma.user.update({
    where: {
      id: user.id
    },
    data:{
      pontos
    }
  })
  ctx.body = {
      name: user.name,
      hunches,
      pontos
  }
}
export const Token = async ctx =>{
  try{
    const data = jwt.verify(ctx.request.body.token, process.env.JWT_SECRET)  
    ctx.body = data.name
    ctx.status = 200
  }catch{
    ctx.body = 'Chave Invalida'
    ctx.status = 500
  }
}
export const list = async ctx =>{
  let hunches = new Array
  try{
    const user = await prisma.user.findMany()
    for(let z =0; z < user.length; z++){
      hunches.push(await prisma.hunch.findMany({
        where: {
            userId: user[z].id
        }
    }))
    }
    let pontos = new Array
    let userId
    let apostas = hunches
    console.log(hunches.length)
    for(let z = 0; z<apostas.length; z++){
      if(apostas[z].length > 0){
        aposta = apostas[z]
        console.log('entrou')
        console.log(aposta)
      }}
  }catch{
    ctx.body = error
    ctx.status = 500
  }
}
export const listar = async ctx => {
  try{
    const users = await prisma.user.findMany()
    let us = users
    if(us[0]?.pontos >= 0){
      console.log("jjj")
      us.sort(function(a,b) {
        return a.pontos < b.pontos ? 1 : a.pontos > b.pontos ? -1 : 0;
    })
      console.log(us)
    }
    ctx.body = users
    ctx.status = 200
  }catch(error){
    ctx.body = error
    ctx.status = 500
  }
}
