import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TTaskDB, TUserDB, TUserTaskDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined

        if(searchTerm == undefined){
            const result = await db("users")
            res.status(200).send(result)        
        }else{
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
      
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body
        
        if(typeof id !== "string") {
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if(id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir ao menos 4 caracteres")
        }

        if(typeof name !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if(name.length < 2) {
            res.status(400)
            throw new Error("'name' deve possuir ao menos 4 caracteres")
        }

        if(typeof email !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if(email.length < 2) {
            res.status(400)
            throw new Error("'name' deve possuir ao menos 4 caracteres")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("users").where({ id })

        if(userIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' existente")
        }

        const [ userEmailAlreadyExists ]: TUserDB[] | undefined[] = await db("users").where({ email })

        if(userEmailAlreadyExists) {
            res.status(400)
            throw new Error("'email' existente")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)

        res.status(201).send({
            message: "User criado com sucesso",
            user: newUser
        })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if(idToDelete[0] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 'f'")
        }

        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("users").where({ id: idToDelete })
    

        if(!userIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }

        await db("users").del().where({ id: idToDelete })

        res.status(200).send({message: "User deletado com sucesso"})
        
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined

        if(searchTerm == undefined){
            const result = await db("tasks")
            res.status(200).send(result)        
        }else{
            const result = await db("tasks")
                .where("title", "LIKE", `%${searchTerm}%`)
                .orWhere("description", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }   
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const { id, title, description } = req.body
        
        if(typeof id !== "string") {
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if(id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir ao menos 4 caracteres")
        }

        if(typeof title !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if(title.length < 2) {
            res.status(400)
            throw new Error("'name' deve possuir ao menos 4 caracteres")
        }

        if(typeof description !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        const [ taskIdAlreadyExists ]: TTaskDB[] | undefined[] = await db("tasks").where({ id })

        if(taskIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' existente")
        }

        const newTask = {
            id,
            title,
            description  
        }

        await db("tasks").insert(newTask)

        const [ insertedTask ]: TTaskDB[] = await db("tasks").where({ id })

        res.status(201).send({
            message: "Task criada com sucesso",
            task: insertedTask
        })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id
        
        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.created_at
        const newStatus = req.body.status
        
        if(newId !== undefined) {
            if(typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }
    
            if(newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir ao menos 4 caracteres")
            }
        }
        
        if (newTitle !== undefined) {
            if(typeof newTitle !== "string") {
                res.status(400)
                throw new Error("'title' deve ser string")
            }
    
            if(newTitle.length < 2) {
                res.status(400)
                throw new Error("'title' deve possuir ao menos 4 caracteres")
            }
        }

        if(newDescription !== undefined) {
            if(typeof newDescription !== "string") {
                res.status(400)
                throw new Error("'description' deve ser string")
            }
        }
        
        if(newCreatedAt !== undefined) {
            if (typeof newCreatedAt !== "string") {
                res.status(400)
                throw new Error("'createdAt' deve ser string")
            }
        }
        
        if(newStatus !== undefined) {
            if (typeof newStatus !== "number") {
                res.status(400)
                throw new Error("'status' deve ser number(0 para incompleta ou 1 para completa)")
            }
        }

        const [ task ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: idToEdit })

        if(!task) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }

        const newTask: TTaskDB = {
            id: newId || task.id,
            title: newTitle || task.title,
            description: newDescription || task.description,
            created_at: newCreatedAt || task.created_at,
            status: isNaN(newStatus) ? task.status : newStatus
        }

        await db("tasks").insert(newTask).where({ id: idToEdit })

        res.status(200).send({
            message: "Task editada com sucesso",
            task: newTask
        })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id
        
        if(idToDelete[0] !== "t"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        const [ taskIdToDelete ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: idToDelete })
    

        if(!taskIdToDelete) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }

        await db("tasks").del().where({ id: idToDelete })

        res.status(200).send({message: "Task deletadoacom sucesso"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId
        const userId = req.params.userId
        
        if(taskId[0] !== "t"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        if(userId[0] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        const [ task ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: taskId })
    
        if(!task) {
            res.status(400)
            throw new Error("'taskId' não encontrado")
        }

        const [ user ]: TUserDB[] | undefined[] = await db("users").where({ id: userId })
    
        if(!user) {
            res.status(400)
            throw new Error("'userId' não encontrado")
        }

        const newUserTask: TUserTaskDB = {
            task_id: taskId,
            user_id: userId
        }

        await db("users_tasks").insert(newUserTask)

        res.status(201).send({ message: "Tarefa atribuida ao usuário com sucesso"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId
        const userId = req.params.userId
        
        if(taskId[0] !== "t"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        if(userId[0] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        const [ task ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: taskId })
    
        if(!task) {
            res.status(400)
            throw new Error("'taskId' não encontrado")
        }

        const [ user ]: TUserDB[] | undefined[] = await db("users").where({ id: userId })
    
        if(!user) {
            res.status(400)
            throw new Error("'userId' não encontrado")
        }

        const newUserTask: TUserTaskDB = {
            task_id: taskId,
            user_id: userId
        }

        await db("users_tasks").insert(newUserTask)

        res.status(201).send({ message: "Tarefa atribuida ao usuário com sucesso"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskIdtoDelete = req.params.taskId
        const userIdtoDelete = req.params.userId
        
        if(taskIdtoDelete[0] !== "t"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        if(userIdtoDelete[0] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        const [ task ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: taskIdtoDelete })
    
        if(!task) {
            res.status(400)
            throw new Error("'taskId' não encontrado")
        }

        const [ user ]: TUserDB[] | undefined[] = await db("users").where({ id: userIdtoDelete })
    
        if(!user) {
            res.status(400)
            throw new Error("'userId' não encontrado")
        }

        await db("users_tasks").del()
            .where({ task_id: taskIdtoDelete})
            .andWhere({ user_id: userIdtoDelete})

        res.status(200).send({ message: "User removido da tarefa com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
