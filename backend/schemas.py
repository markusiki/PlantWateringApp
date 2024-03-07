from marshmallow import Schema, fields, validate


class UnitsSchema(Schema):
    id = fields.Str(required=True, validate=validate.Length(equal=5))
    name = fields.Str(requiered=True, validate=validate.Length(min=2, max=100))
    moistLimit = fields.Int(required=True, validate=validate.Range(min=10000, max=18000))
    waterTime = fields.Int(required=True, validate=validate.Range(min=0, max=180))


class DeviceSchema(Schema):
    autoWatering = fields.Bool(required=True)
    moistMeasureIntervall = fields.Int(required=True, validate=validate.Range(min=1, max=100))