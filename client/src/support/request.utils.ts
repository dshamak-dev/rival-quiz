async function REQUEST(path, props = {}, minDuration = 0) {
  const start = Date.now();

  return fetch(path, {
    ...props,
  }).then(async (res) => {
    if (res.status >= 400) {
      throw new Error(await res.text());
    }

    const now = Date.now();
    const passed = now - start;

    if (minDuration > passed) {
      await new Promise((res) => {
        setTimeout(res, minDuration - passed);
      });
    }

    return res;
  });
}

export async function GET(path, props = null, minDuration = 0) {
  return REQUEST(path, props, minDuration);
}

export async function POST(path, props, minDuration = 0) {
  return REQUEST(
    path,
    {
      method: "POST",
      ...props,
    },
    minDuration
  );
}

export async function PUT_JSON(path, props, minDuration = 0) {
  return POST_JSON(path, { ...props, method: "PUT" }, minDuration);
}

export async function POST_JSON(path, props, minDuration = 0) {
  return POST(
    path,
    {
      ...props,
      headers: {
        ...props?.headers,
        accept: "application/json",
        "content-type": "application/json",
      },
      body:
        typeof props.body === "string"
          ? props.body
          : JSON.stringify(props.body || {}),
    },
    minDuration
  );
}
