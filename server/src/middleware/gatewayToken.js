export function gatewayTokenMiddleware(req, res, next) {
  const token = process.env.GATEWAY_TOKEN
  if (!token) return next()

  const provided = req.headers['x-gateway-token']
  if (!provided || provided !== token) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing gateway token' })
  }
  next()
}
