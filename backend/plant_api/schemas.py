from marshmallow import Schema, fields, validate


class UnitsSchema(Schema):
    id = fields.Str(metadata={'required': True}, validate=validate.Length(equal=5))
    name = fields.Str(metadata={'required': True}, validate=validate.Length(min=2, max=100))
    moistLimit = fields.Int(metadata={'required': True}, validate=validate.Range(min=0, max=100))
    waterTime = fields.Int(metadata={'required': True}, validate=validate.Range(min=0, max=180))
    enableAutoWatering = fields.Bool(metadata={'required': True})
    enableMaxWaterInterval = fields.Bool(metadata={'required': True})
    enableMinWaterInterval = fields.Bool(metadata={'required': True})
    maxWaterInterval = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=180))
    minWaterInterval = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=180))
    waterFlowRate = fields.Decimal(metadata={'required': True})


class DeviceSchema(Schema):
    runTimeProgram = fields.Bool(metadata={'required': True})
    moistMeasureInterval = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=100))
    numberOfUnits = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=4))
    tankVolume = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=100000))
    waterAmount = fields.Int(metadata={'required': True}, validate=validate.Range(min=1, max=100000))
