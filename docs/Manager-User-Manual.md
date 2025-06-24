# PlotVista Manager User Manual
*Version 1.0 - Complete Administrative Guide*

---

## 🚀 Getting Started

### Admin Login
1. **Navigate to:** `https://your-plotvista-url.com`
2. **Click:** "Manager Login" button (top right)
3. **Enter:** Your admin password
4. **Access:** Full administrative features

### Security Note
- **Never share** your admin password
- **Log out** when finished
- **Sessions expire** after 24 hours for security

---

## 📊 Dashboard & Analytics

### Advanced Dashboard View
As a manager, you see additional features:

```
┌─────────────────────────────────────────────────────┐
│  📊 MANAGER DASHBOARD                               │
├─────────────────────────────────────────────────────┤
│  Total: 100  │ Available: 45  │ Multiple Booking    │
│  Booked: 30  │ Agreement: 15  │ Export Data         │
│  Reg: 10     │ Sold: 55.0%    │ Layout Editor       │
└─────────────────────────────────────────────────────┘
```

### Key Performance Indicators (KPIs)
- **Conversion Rate:** Booked → Agreement → Registration
- **Popular Plots:** Multiple bookings indicator
- **Sales Velocity:** Track booking trends
- **Revenue Tracking:** Based on plot status progression

---

## 🏗️ Project Management

### Creating New Projects

#### Method 1: Simple Project
1. **Click:** Project dropdown (top left)
2. **Click:** "Create New Project"
3. **Enter:** Project name
4. **Click:** "Next: Define Layout"
5. **Use Layout Builder** (see Layout section)

#### Method 2: Import Existing Layout
1. Follow steps 1-3 above
2. **Click:** "Import Layout" (if available)
3. **Upload:** Excel file with plot definitions

### Managing Existing Projects
1. **Switch Projects:** Click project dropdown
2. **View:** All projects with plot counts and dates
3. **Select:** Click any project to switch

### Project Information Display
- **Project Name:** Clear identification
- **Total Plots:** Count of all plots
- **Creation Date:** When project was started
- **Current Status:** Active/Inactive

---

## 🛠️ Layout Management

### Accessing Layout Tools
1. **Click:** Settings icon (⚙️) next to project name
2. **Choose:** Layout Management option
3. **Two tabs available:**
   - **Edit Plots:** Modify existing plots
   - **Delete Components:** Remove plots/layouts

### Creating Layouts (Simple Method)

#### Using Dimension-Based Builder
1. **Click:** Layout icon (📐) next to project name
2. **Add Dimensions:**
   - **Length:** e.g., 30 feet
   - **Breadth:** e.g., 40 feet
   - **Plot Count:** How many plots of this size
   - **Mark as Odd:** For irregular plots

3. **Add Multiple Dimensions:**
   - Click "+" to add more dimension types
   - Each dimension type creates its batch of plots
   - New dimensions appear at the top

4. **Generate Layout:**
   - Click "Create Layout"
   - System automatically arranges plots in grid
   - Plot numbers assigned sequentially

### Advanced Plot Management

#### Editing Individual Plots
1. **Access:** Layout Management → Edit Plots tab
2. **Modify:**
   - **Plot Number:** Change to any format (A-001, VILLA-25, etc.)
   - **Dimensions:** Update size specifications
   - **Area:** Modify square footage
   - **Position:** Change row/column placement

3. **Save Changes:** Click "Save All Changes"

#### Bulk Operations
1. **Renumber All Plots:**
   - Click "Renumber All"
   - **Choose starting number:** 1, 100, 300, etc.
   - **Example:** 20 plots starting from 100 = 100-119

2. **Add New Plots:**
   - Click "Add Plot"
   - System finds next available grid position
   - Assigns next available plot number

#### Advanced Plot Numbering
- **Non-Sequential:** Plots don't need to be 1,2,3,4
- **Custom Formats:** 
  - A-001, B-002, C-005 ✅
  - VILLA-100, VILLA-200 ✅
  - TOWER-A-01, TOWER-B-15 ✅
- **Special Characters:** Supports A-1_V2.0, etc.
- **Unicode Support:** Works with multiple languages

### Layout Validation
- **Duplicate Check:** System prevents duplicate plot numbers
- **Error Highlighting:** Invalid entries shown in red
- **Auto-Save:** Changes saved automatically
- **Undo Protection:** Validation before major changes

---

## 👥 Booking Management

### Single Plot Booking
1. **Click:** Any available plot (green)
2. **Plot Context Card opens**
3. **Enter Customer Details:**
   - Customer Name
   - Phone Number
   - Initial Status (usually "Booked")
4. **Click:** "Book Plot"

### Multiple Plot Booking (Same Customer)
1. **Click:** "Multiple Booking" button (header)
2. **Select Plots:** Check multiple available plots
3. **Enter Customer Details:**
   - Name and phone number
   - Status for all selected plots
4. **Cross-Project Support:** Same customer across different projects
5. **Click:** "Book Selected Plots"

### Status Progression Management
Typical customer journey:
```
Available → Booked → Agreement → Registration
   🟢        🟡        🟠         🔵
```

#### Updating Plot Status
1. **Click:** Plot to open context card
2. **Change Status:** Select new status from dropdown
3. **Confirmation:** System asks for confirmation
4. **Update:** Status changes immediately

#### Status Change Confirmations
- **Agreement → Registration:** Shows customer details for verification
- **Status Downgrade:** Requires additional confirmation
- **Bulk Updates:** Confirmation for multiple changes

### Customer Management Across Projects
- **Phone Validation:** System detects existing customers
- **Warning Display:** Shows if customer has other bookings
- **Cross-Reference:** Easy to see customer's complete portfolio

---

## 📈 Data Export & Reporting

### Export Features
1. **Click:** "Export Data" button (header)
2. **Choose Options:**
   - **All Projects** or **Current Project Only**
   - **Date Range** (if needed)
   - **Format:** CSV or Excel

### Export Data Includes
- **Customer Information:** Names, phones, booking dates
- **Plot Details:** Numbers, dimensions, areas, status
- **Booking History:** Complete audit trail
- **Multiple Bookings:** Clearly marked and grouped
- **Project Information:** Names, creation dates

### Generated Reports
- **Sales Summary:** Status distribution
- **Customer List:** Complete contact information
- **Plot Inventory:** Available vs sold analysis
- **Revenue Tracking:** Based on plot progression

---

## 🔧 Advanced Features

### Plot Context Card (Manager View)
When you click any plot, you see:
- **Basic Info:** Number, dimensions, area, status
- **Customer Details:** If booked/sold
- **Action Buttons:**
  - Change Status
  - Edit Customer Info
  - View Booking History
- **Multiple Bookings:** If applicable

### Layout Builder Advanced Options
1. **Grid Customization:**
   - Automatic grid arrangement
   - Smart positioning
   - Gap management

2. **Plot Numbering Strategies:**
   - Sequential (1, 2, 3, 4...)
   - Sectional (A-1, A-2, B-1, B-2...)
   - Custom (Start from any number)

3. **Dimension Management:**
   - Standard sizes (30×40, 40×50)
   - Odd plots (irregular shapes)
   - Area calculations (automatic)

### Backup & Data Safety
- **Auto-Backup:** System automatically backs up data
- **Export Backup:** Regular Excel exports recommended
- **Change Tracking:** All modifications logged
- **Recovery:** Contact IT for data recovery if needed

---

## 🔒 Security Best Practices

### Password Management
- **Use Strong Password:** Minimum 8 characters, mixed case, numbers
- **Regular Updates:** Change password quarterly
- **No Sharing:** Never share admin credentials
- **Secure Location:** Don't save in browser

### Session Management
- **Auto-Logout:** 24-hour session timeout
- **Manual Logout:** Always log out when finished
- **Multiple Devices:** Only one active session allowed
- **Activity Monitoring:** System logs all admin actions

### Data Protection
- **Customer Privacy:** Access customer data only when necessary
- **Export Security:** Secure exported files appropriately
- **Screen Lock:** Lock screen when away from computer
- **Public Access:** Never access admin panel in public spaces

---

## 🚨 Troubleshooting & Support

### Common Issues & Solutions

#### "Changes Not Saving"
1. **Check Internet:** Ensure stable connection
2. **Validation Errors:** Fix red-highlighted fields
3. **Session Timeout:** Log in again
4. **Browser Cache:** Clear cache and cookies

#### "Plot Numbers Won't Update"
1. **Duplicate Check:** Ensure no duplicate numbers
2. **Format Validation:** Check special characters
3. **Save Process:** Click "Save All Changes"
4. **Refresh Page:** Hard refresh (Ctrl+F5)

#### "Cannot Access Admin Features"
1. **Login Status:** Ensure you're logged in as manager
2. **Session Expiry:** Log in again
3. **Password Reset:** Contact IT support
4. **Browser Issues:** Try different browser

#### "Export Not Working"
1. **Pop-up Blocker:** Disable for this site
2. **File Permissions:** Check download folder permissions
3. **Browser Updates:** Ensure browser is current
4. **Data Size:** Large exports may take time

### Performance Optimization
- **Large Projects:** Use filters to reduce display load
- **Multiple Bookings:** Regular cleanup of old bookings
- **Export Size:** Export specific date ranges for large projects
- **Browser Memory:** Close other tabs for better performance

---

## 📞 Support Contacts

### Technical Support
- **IT Support:** it@sizzleproperties.com
- **System Issues:** Report bugs and technical problems
- **Password Reset:** Admin credential management
- **Data Recovery:** Backup and recovery requests

### Training & Usage
- **Sales Manager:** For process questions
- **Admin Training:** Additional feature training
- **Best Practices:** Workflow optimization

### Emergency Contacts
- **System Down:** [Emergency IT Number]
- **Data Loss:** [Emergency IT Number]
- **Security Issues:** [Emergency Security Number]

---

## 📚 Advanced Workflows

### Workflow 1: New Project Setup
1. **Create Project** → Enter name
2. **Define Layout** → Use dimension builder
3. **Configure Plots** → Set custom numbering if needed
4. **Test Booking** → Book one plot to verify system
5. **Train Team** → Show employees new project

### Workflow 2: Bulk Status Updates
1. **Export Current Data** → Backup before changes
2. **Filter Plots** → Show only relevant status
3. **Bulk Select** → Use multiple booking for status changes
4. **Update Status** → Apply changes
5. **Verify Changes** → Check dashboard statistics

### Workflow 3: Monthly Reporting
1. **Export All Projects** → Complete data dump
2. **Filter by Date** → Current month's activity
3. **Analyze Trends** → Check conversion rates
4. **Generate Summary** → Create management report
5. **Archive Data** → Store monthly backups

### Workflow 4: Customer Follow-up
1. **Multiple Bookings Filter** → Find high-interest plots
2. **Export Customer List** → Get contact information
3. **Status Check** → Verify current booking status
4. **Follow-up Actions** → Update status as needed

---

## 🎯 Pro Tips for Managers

### Efficiency Tips
- **Keyboard Shortcuts:** Learn browser shortcuts for faster navigation
- **Bookmark URL:** Save admin login page
- **Multiple Windows:** Open multiple projects in different tabs
- **Regular Exports:** Weekly data backups

### Best Practices
- **Status Consistency:** Maintain clear status progression
- **Customer Communication:** Update status after customer interactions
- **Plot Numbering:** Use consistent numbering schemes
- **Team Training:** Regular training on new features

### Data Management
- **Regular Cleanup:** Remove old test bookings
- **Audit Trail:** Monitor all status changes
- **Customer Privacy:** Access only necessary information
- **Backup Schedule:** Weekly Excel exports recommended

---

## 📋 Quick Reference Guide

### Essential Manager Actions

| Action | Steps | Shortcut |
|--------|-------|----------|
| Create Project | Project dropdown → Create New | No shortcut |
| Edit Layout | Settings icon → Layout Management | Click ⚙️ |
| Book Plot | Click green plot → Enter details | Click plot |
| Change Status | Click plot → Change status | Click plot |
| Export Data | Export button → Choose options | Header button |
| Bulk Renumber | Layout Mgmt → Renumber All | In layout editor |
| Multiple Booking | Multiple Booking button | Header button |
| Add Plot | Layout Mgmt → Add Plot | In edit mode |

### Status Color Reference
- 🟢 **Available** - Ready for booking
- 🟡 **Booked** - Initial payment/interest
- 🟠 **Agreement** - Legal documents signed
- 🔵 **Registration** - Sale completed

### Critical Security Actions
- ✅ **Always logout** when finished
- ✅ **Use strong passwords** 
- ✅ **Regular data exports** for backup
- ❌ **Never share admin access**
- ❌ **Don't access from public computers**

---

*This manual covers all administrative features in PlotVista. For basic viewing features, employees should refer to the Employee User Manual.*