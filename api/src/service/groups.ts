import { RemResGroups, ResGroupStatus, ResReport } from "@/types/common";


export async function fetchGroups(api: string, secret: string, report: string) : Promise<ResGroupStatus[]> {
  const response = await fetch(`${api}/api/v3/status/${report}?view=latest`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": `${secret}`, 
    },
  });

  
  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status} ${response.statusText}`);
  }

  const remote: RemResGroups = await response.json();

  if (remote.groups == null) {
    return [];
  }

  return remote.groups.map(group => ({
    name: group.name,
    status: group.statuses[0]?.value ?? "UNKNOWN"
  }));

  
}