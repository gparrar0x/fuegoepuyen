-- Add metadata column to resources for type-specific properties
-- Persona (volunteer): nombre_completo, dni, edad, telefono, email
-- Vehiculo (water_truck): patente, modelo, color, propietario
-- Equipamiento (equipment): nombre, descripcion

ALTER TABLE resources ADD COLUMN metadata JSONB DEFAULT '{}';

-- Add index for metadata queries
CREATE INDEX idx_resources_metadata ON resources USING GIN (metadata);

-- Comment for documentation
COMMENT ON COLUMN resources.metadata IS 'Type-specific properties: volunteer={nombre_completo,dni,edad,telefono,email}, water_truck={patente,modelo,color,propietario}, equipment={nombre,descripcion}';
