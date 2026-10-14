from typing import Annotated, Optional
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

PyObjectId = Annotated[str, BeforeValidator(str)]


class EquipoBiomedicoCreate(BaseModel):
    nombre: str
    area_hospitalaria: str
    horas_uso: float = Field(ge=0)
    dias_desde_ultimo_mantenimiento: int = Field(ge=0)


class EquipoBiomedicoUpdate(BaseModel):
    nombre: Optional[str] = None
    area_hospitalaria: Optional[str] = None
    horas_uso: Optional[float] = Field(default=None, ge=0)
    dias_desde_ultimo_mantenimiento: Optional[int] = Field(default=None, ge=0)


class EquipoBiomedicoResponse(EquipoBiomedicoCreate):
    model_config = ConfigDict(populate_by_name=True)
    id: PyObjectId = Field(alias="_id")