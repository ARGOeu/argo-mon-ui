import { ResReport } from "@/types/common";


export async function fetchReports(api: string, secret: string) : Promise<ResReport[]> {
  const response = await fetch(`${api}/api/v2/reports`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": `${secret}`, 
    },
  });

  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status} ${response.statusText}`);
  }

  const remote = await response.json();

  const reports: ResReport[] = remote.data.map((item: any) => ({
    name: item.info.name,
    description: item.info.description,
  }));

  return reports;
}