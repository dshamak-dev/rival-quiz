export function normalizeRecord(record) {
  const { _id, ...other } = record.toObject();

  return { ...other, id: _id.toString(), originId: _id };
}

export function createOne(model, payload, normalizer: Function | null) {
  return model.create(payload).then((res) => {
    if (normalizer) {
      return normalizer(res);
    }

    return res;
  });
}

export function findById(model, id, normalizer: Function | null = null) {
  return model.findById(id).then((res) => {
    if (normalizer) {
      normalizer(res);

      return;
    }

    return res;
  });
}

export function findOne(model, query, normalizer: Function | null = null) {
  return model.findOne(query).then((res) => {
    if (normalizer) {
      return normalizer(res);
    }

    return res;
  });
}

export function findByIdAndUpdate(
  model,
  id,
  payload,
  normalizer: Function | null = null
) {
  return model.findByIdAndUpdate(id, payload, { new: true }).then((res) => {
    if (normalizer) {
      return normalizer(res);
    }

    return res;
  });
}

export function findMany(model, query, normalizer: Function | null = null) {
  return model.find(query).then((res) => {
    if (normalizer) {
      return res.map(normalizer);
    }

    return res;
  });
}

export function findAndUpdate(model, query, payload, normalizer : Function | null= null) {
  return model.updateMany(query, payload, { new: true }).then((res) => {
    if (normalizer) {
      return res.map(normalizer);
    }

    return res;
  });
}
