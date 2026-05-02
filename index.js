require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { port } = require('./config/config');
const ordersRouter = require('./routes/orders');

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGINS;
app.use(cors({
  origin: allowedOrigin || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Api-Key'],
}));
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MS4 Orquestador - ReadMe',
      version: '1.0.0',
      description: 'Orquestador de solicitudes de compra/intercambio de libros físicos',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/orders', ordersRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`MS4 Orquestador corriendo en http://localhost:${port}`);
  console.log(`Swagger disponible en http://localhost:${port}/swagger`);
});
