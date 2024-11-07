require('dotenv').config()
const express = require('express'),
    app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.get('/', async (req, res) => {

    try {

        const response = await fetch('https://api.telegram.org/bot7550266948:AAF5oobYdr9eZHmhC0hkI9ldXqzKBgoIfGo/getUpdates')

        res.json({data: await response.json()})

    } catch (error) {
        res.json({message: 'error', error: error.message})
    }
})

app.listen(process.env.PORT, () => {
    console.log("bot backend started @", process.env.PORT)
})