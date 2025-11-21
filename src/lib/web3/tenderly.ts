const T_USER = process.env.TENDERLY_USER;
const T_PROJECT = process.env.TENDERLY_PROJECT;
const T_KEY = process.env.TENDERLY_ACCESS_KEY;

export function isTenderlyConfigured() {
  return Boolean(T_USER && T_PROJECT && T_KEY);
}

interface TenderlySimulationBody {
  network_id: string;
  from: `0x${string}`;
  to: `0x${string}`;
  input: string;
  gas: number;
  gas_price: string;
  value: string;
  save: boolean;
  save_if_fails: boolean;
  simulation_type: "quick";
  state_objects: Record<
    string,
    {
      balance: string;
    }
  >;
}

interface TenderlySimulationResponse {
  simulation?: {
    id?: string;
    public_link?: string;
  };
  id?: string;
  public_link?: string;
}

export async function tenderlySimulateTx({
  chainId = 84532,
  from,
  to,
  data = "0x",
  value = "0x0",
}: {
  chainId?: number;
  from: `0x${string}`;
  to: `0x${string}`;
  data?: `0x${string}` | string;
  value?: `0x${string}` | string;
}) {
  if (!isTenderlyConfigured()) throw new Error("Tenderly not configured");

  const url = `https://api.tenderly.co/api/v1/account/${T_USER}/project/${T_PROJECT}/simulate`;

  const body: TenderlySimulationBody = {
    network_id: String(chainId),
    from,
    to,
    input: data,
    gas: 1_500_000,
    gas_price: "0x3B9ACA00",
    value,
    save: true,
    save_if_fails: true,
    simulation_type: "quick",
    state_objects: {
      [from]: {
        balance: "0x56BC75E2D63100000", // 10 ETH
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": String(T_KEY),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Tenderly simulate failed: ${res.status}`);
  }

  const sim = (await res.json()) as TenderlySimulationResponse;
  const simId = sim?.simulation?.id || sim?.id;

  if (!simId) throw new Error("Missing simulation id");

  const shareUrl = `https://api.tenderly.co/api/v1/account/${T_USER}/project/${T_PROJECT}/simulations/${simId}/share`;

  const shareRes = await fetch(shareUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": String(T_KEY),
    },
  });

  if (!shareRes.ok) {
    throw new Error(`Tenderly share failed: ${shareRes.status}`);
  }

  const shared = (await shareRes.json()) as TenderlySimulationResponse;
  const publicUrl = shared?.simulation?.public_link || shared?.public_link;

  return { simulationId: simId, publicUrl };
}
