from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from pricing_engine import agent as pricing_agent
from shelf_vision import detector as vision_detector
import uvicorn
import os

app = FastAPI(title="MSME AI Brain", description="Advanced AI Service for Retail Intelligence")

class PricingRequest(BaseModel):
    product_name: str
    base_price: float
    current_stock: int
    days_to_expiry: int
    competitor_price: float

class PricingFeedback(BaseModel):
    product_name: str
    base_price: float
    current_stock: int
    days_to_expiry: int
    competitor_price: float
    applied_multiplier: float
    actual_profit_made: float

@app.get("/")
def read_root():
    return {"status": "AI Brain Online", "mode": "Active"}

@app.post("/pricing/optimize")
def optimize_price(request: PricingRequest):
    try:
        result = pricing_agent.suggest_price(
            request.base_price,
            request.current_stock,
            request.days_to_expiry,
            request.competitor_price
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pricing/learn")
def learn_pricing(feedback: PricingFeedback):
    # Calculate state
    ratio = feedback.competitor_price / feedback.base_price if feedback.base_price > 0 else 1.0
    state = pricing_agent.get_state_key(feedback.current_stock, feedback.days_to_expiry, ratio)
    
    # We assume 'next_state' is slightly different (e.g., less stock), but for simple Q-learning updates
    # we can approximate next state or just use the current one if not tracking full trajectory.
    # For now, let's assume stock dropped by 1.
    next_state = pricing_agent.get_state_key(max(0, feedback.current_stock - 1), feedback.days_to_expiry, ratio)
    
    pricing_agent.learn(state, feedback.applied_multiplier, feedback.actual_profit_made, next_state)
    return {"status": "learned", "reward": feedback.actual_profit_made}

@app.post("/vision/analyze")
async def analyze_shelf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = vision_detector.analyze_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
