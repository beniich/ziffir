export interface SpreadsheetMeta {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      title: string;
      sheetId: number;
    };
  }>;
}

export const sheetsService = {
  // Check if spreadsheet exists and get properties
  async getSpreadsheetMetadata(spreadsheetId: string, token: string): Promise<SpreadsheetMeta> {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Sheets API Error (${response.status}): ${errText || 'Invalid Spreadsheet ID'}`);
    }

    return await response.json();
  },

  // Create a brand new Google Spreadsheet in user account
  async createSpreadsheet(token: string, title: string = "Zafir Prestige Management Ledger"): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title
        },
        sheets: [
          { properties: { title: "VIP Guests" } },
          { properties: { title: "Audit Logs" } },
          { properties: { title: "Room Service Orders" } }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create spreadsheet: ${errText}`);
    }

    const data = await response.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
    };
  },

  // Read range of value arrays
  async readValues(spreadsheetId: string, range: string, token: string): Promise<any[][] | null> {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const errText = await response.text();
      throw new Error(`Failed to read sheet cells: ${errText}`);
    }

    const data = await response.json();
    return data.values || null;
  },

  // Write sheet values in an absolute range (PUT overrides)
  async writeValues(spreadsheetId: string, range: string, values: any[][], token: string): Promise<any> {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to write sheet cells: ${errText}`);
    }

    return await response.json();
  },

  // Append values list beautifully (POST appends)
  async appendValues(spreadsheetId: string, range: string, values: any[][], token: string): Promise<any> {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to append rows values: ${errText}`);
    }

    return await response.json();
  },

  // Clear range of records
  async clearRange(spreadsheetId: string, range: string, token: string): Promise<any> {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to clear range: ${errText}`);
    }

    return await response.json();
  }
};
