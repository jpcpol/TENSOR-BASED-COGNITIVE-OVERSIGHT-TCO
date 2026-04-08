from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import vector, tensor, inference, policy, experiment

app = FastAPI(
    title="TCO Engine API",
    version="0.1.0",
    description="Tensor-Based Cognitive Oversight — REST API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vector.router,     prefix="/vector",     tags=["vector"])
app.include_router(tensor.router,     prefix="/tensor",     tags=["tensor"])
app.include_router(inference.router,  prefix="/inference",  tags=["inference"])
app.include_router(policy.router,     prefix="/policy",     tags=["policy"])
app.include_router(experiment.router, prefix="/experiment", tags=["experiment"])


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "0.1.0"}
