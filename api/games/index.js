import { PrismaClient } from '@prisma/client'
import { addDays, formatISO, getHours, addHours, getDayOfYear } from 'date-fns'

const prisma = new PrismaClient()
let DiaAtual = new Date().toISOString('pt-BR')
DiaAtual = getDayOfYear(new Date(DiaAtual))
export const list = async ctx => {
  let currentDate = ctx.request.query.gameTime
  if(currentDate < (new Date().toISOString('pt-BR'))){
    return(
      ctx.body = [],
      ctx.status = 200
    )
  }
  const hora = getHours(new Date(currentDate))  
  const horaAtual = addHours(new Date(currentDate), -(hora));
  if(getDayOfYear(new Date(currentDate)) > DiaAtual){
    currentDate = horaAtual
  }
  const where = currentDate ?{
    gameTime: {
      gte: currentDate,
      lt: formatISO(addDays(new Date (horaAtual), 1))
    }
  }: {}

  try{
    const games = await prisma.game.findMany({where})
    ctx.body = games
    ctx.status = 200
  }catch(error){
    console.log(error)
    ctx.body = error
    ctx.status = 500
  }
}
