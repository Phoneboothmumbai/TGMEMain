/**
 * Device-type-specific configuration fields for the Asset Management form.
 * Each type has a set of spec fields that appear when that type is selected.
 */

export const ASSET_TYPE_CONFIGS = {
  laptop: {
    label: 'Laptop',
    specFields: [
      { key: 'processor', label: 'Processor', placeholder: 'e.g. Intel i5-1340P / Apple M3', type: 'text' },
      { key: 'ram', label: 'RAM', placeholder: 'e.g. 16GB DDR5', type: 'text' },
      { key: 'storage', label: 'Storage', placeholder: 'e.g. 512GB NVMe SSD', type: 'text' },
      { key: 'os', label: 'Operating System', placeholder: 'e.g. Windows 11 Pro', type: 'select', options: ['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'macOS Sonoma', 'macOS Ventura', 'Ubuntu 24.04', 'Chrome OS', 'Other'] },
      { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 15.6"', type: 'text' },
      { key: 'battery_health', label: 'Battery Health', placeholder: 'e.g. Good / 85%', type: 'text' },
      { key: 'charger_type', label: 'Charger Type', placeholder: 'e.g. USB-C / Barrel', type: 'text' },
    ],
  },
  desktop: {
    label: 'Desktop',
    specFields: [
      { key: 'processor', label: 'Processor', placeholder: 'e.g. Intel i7-13700', type: 'text' },
      { key: 'ram', label: 'RAM', placeholder: 'e.g. 32GB DDR5', type: 'text' },
      { key: 'storage', label: 'Storage', placeholder: 'e.g. 1TB NVMe SSD', type: 'text' },
      { key: 'os', label: 'Operating System', placeholder: 'e.g. Windows 11 Pro', type: 'select', options: ['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'macOS Sonoma', 'Ubuntu 24.04', 'Other'] },
      { key: 'gpu', label: 'Graphics Card', placeholder: 'e.g. NVIDIA RTX 4060', type: 'text' },
      { key: 'form_factor', label: 'Form Factor', placeholder: '', type: 'select', options: ['Tower', 'SFF (Small Form Factor)', 'Mini PC', 'All-in-One', 'Workstation'] },
      { key: 'psu', label: 'Power Supply', placeholder: 'e.g. 500W', type: 'text' },
    ],
  },
  monitor: {
    label: 'Monitor',
    specFields: [
      { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 27"', type: 'text' },
      { key: 'resolution', label: 'Resolution', placeholder: '', type: 'select', options: ['1920x1080 (FHD)', '2560x1440 (QHD)', '3840x2160 (4K)', '1366x768 (HD)', '1600x900 (HD+)', 'Other'] },
      { key: 'panel_type', label: 'Panel Type', placeholder: '', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED', 'Unknown'] },
      { key: 'ports', label: 'Ports', placeholder: 'e.g. HDMI x2, DP x1, VGA x1', type: 'text' },
      { key: 'vesa_mount', label: 'VESA Mount', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'refresh_rate', label: 'Refresh Rate', placeholder: 'e.g. 75Hz', type: 'text' },
    ],
  },
  printer: {
    label: 'Printer',
    specFields: [
      { key: 'printer_type', label: 'Printer Type', placeholder: '', type: 'select', options: ['Laser', 'Inkjet', 'Dot Matrix', 'Thermal', 'Label Printer', 'Plotter'] },
      { key: 'color_mode', label: 'Color', placeholder: '', type: 'select', options: ['Color', 'Mono (B&W)'] },
      { key: 'connectivity', label: 'Connectivity', placeholder: '', type: 'select', options: ['USB Only', 'USB + Network (LAN)', 'USB + WiFi', 'USB + Network + WiFi', 'Network Only'] },
      { key: 'duplex', label: 'Auto Duplex', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'scanner', label: 'Scanner/Copier', placeholder: '', type: 'select', options: ['Yes (MFP)', 'No (Print Only)'] },
      { key: 'paper_size', label: 'Max Paper Size', placeholder: '', type: 'select', options: ['A4', 'A3', 'Legal', 'A4 + Legal'] },
      { key: 'toner_cartridge', label: 'Toner/Cartridge Model', placeholder: 'e.g. HP 26A / Canon 337', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.100', type: 'text' },
    ],
  },
  server: {
    label: 'Server',
    specFields: [
      { key: 'processor', label: 'Processor', placeholder: 'e.g. Intel Xeon E-2334 x2', type: 'text' },
      { key: 'ram', label: 'RAM', placeholder: 'e.g. 64GB ECC DDR4', type: 'text' },
      { key: 'storage', label: 'Storage', placeholder: 'e.g. 4x 1TB SAS RAID-5', type: 'text' },
      { key: 'raid_config', label: 'RAID Config', placeholder: '', type: 'select', options: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10', 'No RAID', 'Other'] },
      { key: 'os', label: 'Operating System', placeholder: 'e.g. Windows Server 2022', type: 'select', options: ['Windows Server 2022', 'Windows Server 2019', 'Windows Server 2016', 'Ubuntu Server', 'CentOS', 'ESXi / VMware', 'Proxmox', 'Other'] },
      { key: 'rack_unit', label: 'Rack Unit (U)', placeholder: 'e.g. 1U, 2U, Tower', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.10', type: 'text' },
      { key: 'roles', label: 'Server Roles', placeholder: 'e.g. AD, DNS, File Server', type: 'text' },
      { key: 'remote_access', label: 'Remote Access', placeholder: 'e.g. iLO / iDRAC IP', type: 'text' },
    ],
  },
  ups: {
    label: 'UPS',
    specFields: [
      { key: 'kva_rating', label: 'KVA Rating', placeholder: 'e.g. 1KVA, 3KVA, 10KVA', type: 'text' },
      { key: 'phase', label: 'Phase', placeholder: '', type: 'select', options: ['Single Phase', 'Three Phase'] },
      { key: 'ups_type', label: 'UPS Type', placeholder: '', type: 'select', options: ['Online', 'Line Interactive', 'Offline/Standby'] },
      { key: 'battery_type', label: 'Battery Type', placeholder: 'e.g. SMF 12V 7Ah x2', type: 'text' },
      { key: 'backup_time', label: 'Backup Time', placeholder: 'e.g. 30 mins at full load', type: 'text' },
      { key: 'battery_last_replaced', label: 'Battery Last Replaced', placeholder: 'e.g. 2024-06', type: 'text' },
      { key: 'connected_devices', label: 'Connected Devices', placeholder: 'e.g. Server + Switch', type: 'text' },
    ],
  },
  router: {
    label: 'Router',
    specFields: [
      { key: 'wan_ports', label: 'WAN Ports', placeholder: 'e.g. 1x GbE WAN', type: 'text' },
      { key: 'lan_ports', label: 'LAN Ports', placeholder: 'e.g. 4x GbE LAN', type: 'text' },
      { key: 'wifi_standard', label: 'WiFi Standard', placeholder: '', type: 'select', options: ['WiFi 6E (AX)', 'WiFi 6 (AX)', 'WiFi 5 (AC)', 'WiFi 4 (N)', 'No WiFi'] },
      { key: 'throughput', label: 'Throughput', placeholder: 'e.g. 1Gbps', type: 'text' },
      { key: 'vpn_support', label: 'VPN Support', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'ip_address', label: 'Management IP', placeholder: 'e.g. 192.168.1.1', type: 'text' },
      { key: 'wan_ip', label: 'WAN / Public IP', placeholder: 'e.g. Static / DHCP', type: 'text' },
      { key: 'isp', label: 'ISP', placeholder: 'e.g. Airtel, Jio, BSNL', type: 'text' },
      { key: 'login_credentials', label: 'Admin Login', placeholder: 'e.g. admin / ****', type: 'text' },
    ],
  },
  switch: {
    label: 'Switch',
    specFields: [
      { key: 'port_count', label: 'Total Ports', placeholder: 'e.g. 24', type: 'text' },
      { key: 'switch_type', label: 'Switch Type', placeholder: '', type: 'select', options: ['Managed', 'Unmanaged', 'Smart Managed', 'Layer 3'] },
      { key: 'speed', label: 'Port Speed', placeholder: '', type: 'select', options: ['100Mbps', '1Gbps', '2.5Gbps', '10Gbps', 'Mixed'] },
      { key: 'poe', label: 'PoE', placeholder: '', type: 'select', options: ['Yes (PoE)', 'Yes (PoE+)', 'Yes (PoE++)', 'No'] },
      { key: 'poe_budget', label: 'PoE Budget (W)', placeholder: 'e.g. 250W', type: 'text' },
      { key: 'sfp_ports', label: 'SFP/Uplink Ports', placeholder: 'e.g. 2x SFP+', type: 'text' },
      { key: 'ip_address', label: 'Management IP', placeholder: 'e.g. 192.168.1.2', type: 'text' },
      { key: 'rack_mounted', label: 'Rack Mounted', placeholder: '', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  access_point: {
    label: 'Access Point',
    specFields: [
      { key: 'wifi_standard', label: 'WiFi Standard', placeholder: '', type: 'select', options: ['WiFi 6E (AX)', 'WiFi 6 (AX)', 'WiFi 5 (AC)', 'WiFi 4 (N)'] },
      { key: 'max_clients', label: 'Max Clients', placeholder: 'e.g. 128', type: 'text' },
      { key: 'poe', label: 'PoE Powered', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'placement', label: 'Placement', placeholder: '', type: 'select', options: ['Indoor - Ceiling', 'Indoor - Wall', 'Outdoor', 'Desktop'] },
      { key: 'ip_address', label: 'Management IP', placeholder: 'e.g. 192.168.1.50', type: 'text' },
      { key: 'ssids', label: 'SSIDs Configured', placeholder: 'e.g. OfficeWiFi, GuestWiFi', type: 'text' },
      { key: 'controller', label: 'Controller', placeholder: 'e.g. UniFi / Omada / Standalone', type: 'text' },
    ],
  },
  firewall: {
    label: 'Firewall',
    specFields: [
      { key: 'throughput', label: 'Firewall Throughput', placeholder: 'e.g. 3.5Gbps', type: 'text' },
      { key: 'vpn_throughput', label: 'VPN Throughput', placeholder: 'e.g. 1Gbps', type: 'text' },
      { key: 'max_vpn_tunnels', label: 'Max VPN Tunnels', placeholder: 'e.g. 100', type: 'text' },
      { key: 'max_users', label: 'Max Users', placeholder: 'e.g. 50', type: 'text' },
      { key: 'utm_features', label: 'UTM Features', placeholder: 'e.g. AV, IPS, Web Filter, App Control', type: 'text' },
      { key: 'wan_ports', label: 'WAN Ports', placeholder: 'e.g. 2x GbE', type: 'text' },
      { key: 'lan_ports', label: 'LAN Ports', placeholder: 'e.g. 8x GbE', type: 'text' },
      { key: 'ip_address', label: 'Management IP', placeholder: 'e.g. 192.168.1.1', type: 'text' },
      { key: 'license_expiry', label: 'UTM License Expiry', placeholder: 'YYYY-MM-DD', type: 'date' },
    ],
  },
  nas: {
    label: 'NAS',
    specFields: [
      { key: 'bays', label: 'Drive Bays', placeholder: 'e.g. 4-bay', type: 'text' },
      { key: 'total_storage', label: 'Total Storage', placeholder: 'e.g. 16TB (4x 4TB)', type: 'text' },
      { key: 'raid_config', label: 'RAID Config', placeholder: '', type: 'select', options: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10', 'JBOD', 'SHR'] },
      { key: 'ram', label: 'RAM', placeholder: 'e.g. 4GB', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.20', type: 'text' },
      { key: 'max_users', label: 'Max Concurrent Users', placeholder: 'e.g. 20', type: 'text' },
      { key: 'backup_target', label: 'Used As Backup For', placeholder: 'e.g. Server, Workstations', type: 'text' },
    ],
  },
  phone: {
    label: 'Phone',
    specFields: [
      { key: 'phone_type', label: 'Phone Type', placeholder: '', type: 'select', options: ['IP Phone', 'Analog Phone', 'Smartphone', 'Cordless'] },
      { key: 'extension', label: 'Extension Number', placeholder: 'e.g. 101', type: 'text' },
      { key: 'mac_address', label: 'MAC Address', placeholder: 'e.g. AA:BB:CC:DD:EE:FF', type: 'text' },
      { key: 'poe', label: 'PoE Powered', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'pbx_system', label: 'PBX System', placeholder: 'e.g. FreePBX / 3CX / Analog', type: 'text' },
    ],
  },
  tablet: {
    label: 'Tablet',
    specFields: [
      { key: 'os', label: 'Operating System', placeholder: '', type: 'select', options: ['iPadOS', 'Android', 'Windows', 'Other'] },
      { key: 'storage', label: 'Storage', placeholder: 'e.g. 128GB', type: 'text' },
      { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 10.9"', type: 'text' },
      { key: 'cellular', label: 'Cellular', placeholder: '', type: 'select', options: ['WiFi Only', 'WiFi + Cellular'] },
      { key: 'mdm_enrolled', label: 'MDM Enrolled', placeholder: '', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  scanner: {
    label: 'Scanner',
    specFields: [
      { key: 'scanner_type', label: 'Scanner Type', placeholder: '', type: 'select', options: ['Flatbed', 'Sheet-fed (ADF)', 'Portable', 'Network Scanner'] },
      { key: 'connectivity', label: 'Connectivity', placeholder: '', type: 'select', options: ['USB', 'USB + Network', 'USB + WiFi', 'Network Only'] },
      { key: 'duplex', label: 'Auto Duplex Scan', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'adf_capacity', label: 'ADF Capacity', placeholder: 'e.g. 50 sheets', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.101', type: 'text' },
    ],
  },
  projector: {
    label: 'Projector',
    specFields: [
      { key: 'projector_type', label: 'Type', placeholder: '', type: 'select', options: ['DLP', 'LCD', 'LED', 'Laser'] },
      { key: 'lumens', label: 'Brightness (Lumens)', placeholder: 'e.g. 3600', type: 'text' },
      { key: 'resolution', label: 'Native Resolution', placeholder: '', type: 'select', options: ['1920x1080 (FHD)', '1280x800 (WXGA)', '1024x768 (XGA)', '3840x2160 (4K)'] },
      { key: 'connectivity', label: 'Ports', placeholder: 'e.g. HDMI x2, VGA, USB', type: 'text' },
      { key: 'lamp_hours', label: 'Lamp Hours Used', placeholder: 'e.g. 2500 / 10000', type: 'text' },
      { key: 'mount', label: 'Mount Type', placeholder: '', type: 'select', options: ['Ceiling Mounted', 'Table/Portable', 'Short Throw'] },
    ],
  },
  webcam: {
    label: 'Webcam',
    specFields: [
      { key: 'resolution', label: 'Resolution', placeholder: '', type: 'select', options: ['4K', '1080p', '720p'] },
      { key: 'connectivity', label: 'Connectivity', placeholder: '', type: 'select', options: ['USB-A', 'USB-C', 'Wireless'] },
      { key: 'microphone', label: 'Built-in Mic', placeholder: '', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  headset: {
    label: 'Headset',
    specFields: [
      { key: 'headset_type', label: 'Type', placeholder: '', type: 'select', options: ['Wired USB', 'Wired 3.5mm', 'Bluetooth', 'USB Dongle Wireless', 'DECT'] },
      { key: 'microphone', label: 'Microphone', placeholder: '', type: 'select', options: ['Boom Mic', 'Inline Mic', 'No Mic'] },
      { key: 'noise_cancelling', label: 'Noise Cancelling', placeholder: '', type: 'select', options: ['Yes (ANC)', 'Passive', 'No'] },
    ],
  },
  keyboard: {
    label: 'Keyboard',
    specFields: [
      { key: 'connectivity', label: 'Connectivity', placeholder: '', type: 'select', options: ['Wired USB', 'Wireless USB Dongle', 'Bluetooth', 'Wired + Bluetooth'] },
      { key: 'layout', label: 'Layout', placeholder: '', type: 'select', options: ['Full Size', 'TKL (Tenkeyless)', 'Compact/75%', 'Ergonomic'] },
    ],
  },
  mouse: {
    label: 'Mouse',
    specFields: [
      { key: 'connectivity', label: 'Connectivity', placeholder: '', type: 'select', options: ['Wired USB', 'Wireless USB Dongle', 'Bluetooth', 'Wired + Bluetooth'] },
      { key: 'mouse_type', label: 'Type', placeholder: '', type: 'select', options: ['Standard', 'Ergonomic', 'Trackball', 'Vertical'] },
    ],
  },
  cctv: {
    label: 'CCTV Camera',
    specFields: [
      { key: 'camera_type', label: 'Camera Type', placeholder: '', type: 'select', options: ['Dome', 'Bullet', 'PTZ', 'Turret', 'Box', 'Fisheye'] },
      { key: 'resolution', label: 'Resolution', placeholder: '', type: 'select', options: ['2MP (1080p)', '4MP (2K)', '5MP', '8MP (4K)', '12MP'] },
      { key: 'night_vision', label: 'Night Vision', placeholder: '', type: 'select', options: ['IR (Infrared)', 'Color Night Vision', 'No Night Vision'] },
      { key: 'placement', label: 'Placement', placeholder: '', type: 'select', options: ['Indoor', 'Outdoor', 'Indoor/Outdoor'] },
      { key: 'poe', label: 'PoE Powered', placeholder: '', type: 'select', options: ['Yes', 'No'] },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.64', type: 'text' },
      { key: 'storage_device', label: 'Recording To', placeholder: 'e.g. NVR Channel 5 / SD Card', type: 'text' },
      { key: 'location_detail', label: 'Camera Position', placeholder: 'e.g. Main entrance, 2nd floor corridor', type: 'text' },
    ],
  },
  nvr: {
    label: 'NVR / DVR',
    specFields: [
      { key: 'recorder_type', label: 'Type', placeholder: '', type: 'select', options: ['NVR', 'DVR'] },
      { key: 'channels', label: 'Channels', placeholder: 'e.g. 16', type: 'text' },
      { key: 'storage', label: 'HDD Storage', placeholder: 'e.g. 2x 4TB', type: 'text' },
      { key: 'cameras_connected', label: 'Cameras Connected', placeholder: 'e.g. 12 / 16', type: 'text' },
      { key: 'poe_ports', label: 'PoE Ports', placeholder: 'e.g. 16', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.60', type: 'text' },
      { key: 'remote_access', label: 'Remote Access', placeholder: 'e.g. Hik-Connect / P2P ID', type: 'text' },
      { key: 'recording_days', label: 'Recording Retention', placeholder: 'e.g. ~30 days', type: 'text' },
    ],
  },
  other: {
    label: 'Other',
    specFields: [
      { key: 'description', label: 'Device Description', placeholder: 'Describe the device', type: 'text' },
      { key: 'connectivity', label: 'Connectivity', placeholder: 'e.g. USB, Network, WiFi', type: 'text' },
      { key: 'ip_address', label: 'IP Address', placeholder: 'e.g. 192.168.1.x', type: 'text' },
    ],
  },
};

// Bulk upload CSV template headers per device type
export const BULK_TEMPLATE_HEADERS = {
  common: ['client_name', 'location', 'type', 'brand', 'model', 'serial_number', 'status', 'assigned_to', 'purchase_date', 'warranty_expiry', 'notes'],
  laptop: ['processor', 'ram', 'storage', 'os', 'screen_size'],
  desktop: ['processor', 'ram', 'storage', 'os', 'gpu', 'form_factor'],
  server: ['processor', 'ram', 'storage', 'raid_config', 'os', 'ip_address', 'roles'],
  printer: ['printer_type', 'color_mode', 'connectivity', 'ip_address', 'toner_cartridge'],
  router: ['wan_ports', 'lan_ports', 'wifi_standard', 'ip_address', 'isp'],
  switch: ['port_count', 'switch_type', 'speed', 'poe', 'ip_address'],
  cctv: ['camera_type', 'resolution', 'night_vision', 'placement', 'ip_address', 'location_detail'],
  nvr: ['recorder_type', 'channels', 'storage', 'ip_address', 'cameras_connected'],
  firewall: ['throughput', 'max_users', 'utm_features', 'ip_address', 'license_expiry'],
  ups: ['kva_rating', 'phase', 'ups_type', 'battery_type', 'backup_time'],
  access_point: ['wifi_standard', 'max_clients', 'poe', 'placement', 'ip_address'],
  monitor: ['screen_size', 'resolution', 'panel_type', 'ports'],
  nas: ['bays', 'total_storage', 'raid_config', 'ip_address'],
  default: [],
};

// Type options including CCTV and NVR
export const ALL_TYPE_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'printer', label: 'Printer' },
  { value: 'server', label: 'Server' },
  { value: 'ups', label: 'UPS' },
  { value: 'router', label: 'Router' },
  { value: 'switch', label: 'Switch' },
  { value: 'access_point', label: 'Access Point' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'cctv', label: 'CCTV Camera' },
  { value: 'nvr', label: 'NVR / DVR' },
  { value: 'nas', label: 'NAS' },
  { value: 'phone', label: 'Phone / IP Phone' },
  { value: 'tablet', label: 'Tablet / iPad' },
  { value: 'scanner', label: 'Scanner' },
  { value: 'projector', label: 'Projector' },
  { value: 'webcam', label: 'Webcam' },
  { value: 'headset', label: 'Headset' },
  { value: 'keyboard', label: 'Keyboard' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'other', label: 'Other' },
];
