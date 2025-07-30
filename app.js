require('dotenv').config();

const { logDebug } = require('./utils/logger');

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger.json');

const swaggerJsdoc = require('swagger-jsdoc');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// Middleware de logging para debug
app.use((req, res, next) => {
	const timestamp = new Date().toISOString();
	logDebug(`[${timestamp}] ${req.method} ${req.path}`);
	logDebug(`[${timestamp}] Headers:`, JSON.stringify(req.headers, null, 2));
	logDebug(`[${timestamp}] Body:`, JSON.stringify(req.body, null, 2));
	logDebug(`[${timestamp}] Query:`, JSON.stringify(req.query, null, 2));
	logDebug(`[${timestamp}] Params:`, JSON.stringify(req.params, null, 2));
	logDebug('---');
	next();
});

app.use(express.json());

// Swagger config
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'API Login de Usuários',
			version: '1.0.0',
			description: 'API para gestão de login de usuários',
		},
		servers: [{ url: 'http://localhost:3000' }],
	},
	apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint de health check
app.get('/health', (req, res) => {
	logDebug('=== HEALTH CHECK ENDPOINT CALLED ===');
	res.status(200).json({
		status: 'ok',
		message: 'API está funcionando',
		timestamp: new Date().toISOString(),
	});
});

// Rotas
app.use('/', userRoutes);

// Inicialização
const PORT = process.env.PORT || 3000;

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
