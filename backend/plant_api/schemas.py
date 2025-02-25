from marshmallow import Schema, fields, validate


class UnitsSchema(Schema):
    id = fields.Str(required=True, validate=validate.Length(equal=5))
    name = fields.Str(requiered=True, validate=validate.Length(min=2, max=100))
    moistLimit = fields.Int(required=True, validate=validate.Range(min=0, max=100))
    waterTime = fields.Int(required=True, validate=validate.Range(min=0, max=180))
    enableAutoWatering = fields.Bool(required=True)
    enableMaxWaterInterval = fields.Bool(required=True)
    enableMinWaterInterval = fields.Bool(required=True)
    maxWaterInterval = fields.Int(required=True, validate=validate.Range(min=1, max=180))
    minWaterInterval = fields.Int(required=True, validate=validate.Range(min=1, max=180))


class DeviceSchema(Schema):
    runTimeProgram = fields.Bool(required=True)
    moistMeasureInterval = fields.Int(required=True, validate=validate.Range(min=1, max=100))
    numberOfUnits = fields.Int(required=True, validate=validate.Range(min=1, max=4))
