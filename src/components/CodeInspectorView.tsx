import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Terminal, 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../services/storage';
import { SqlLogEntry } from '../types/blood-donation';

const JAVA_FILES: Record<string, { title: string; filename: string; code: string; desc: string }> = {
  db: {
    title: 'Database Connection',
    filename: 'DatabaseConnection.java',
    desc: 'Connects Java to MySQL via JDBC Driver (jdbc:mysql://localhost:3306/blood_donation).',
    code: `package blooddonation;

import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {

    private static final String URL =
            "jdbc:mysql://localhost:3306/blood_donation";

    private static final String USERNAME = "root";

    private static final String PASSWORD = "Dharshini@2008";

    public static Connection getConnection() {

        try {

            Class.forName("com.mysql.cj.jdbc.Driver");

            return DriverManager.getConnection(
                    URL,
                    USERNAME,
                    PASSWORD
            );

        } catch (Exception e) {

            e.printStackTrace();
            return null;
        }
    }
}`
  },
  search: {
    title: 'Donor Search Servlet',
    filename: 'DonorSearchServlet.java',
    desc: 'Executes compatibility matrix SQL query filtering by eligible=YES and recent_illness=NO.',
    code: `package blooddonation;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/searchDonors")
public class DonorSearchServlet extends HttpServlet {

    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        String bloodGroup = request.getParameter("bloodGroup");
        String compatibleGroups;

        if (bloodGroup.equalsIgnoreCase("A+")) {
            compatibleGroups = "'A+','A-','O+','O-'";
        } else if (bloodGroup.equalsIgnoreCase("A-")) {
            compatibleGroups = "'A-','O-'";
        } else if (bloodGroup.equalsIgnoreCase("B+")) {
            compatibleGroups = "'B+','B-','O+','O-'";
        } else if (bloodGroup.equalsIgnoreCase("B-")) {
            compatibleGroups = "'B-','O-'";
        } else if (bloodGroup.equalsIgnoreCase("AB+")) {
            compatibleGroups = "'A+','A-','B+','B-','AB+','AB-','O+','O-'";
        } else if (bloodGroup.equalsIgnoreCase("AB-")) {
            compatibleGroups = "'A-','B-','AB-','O-'";
        } else if (bloodGroup.equalsIgnoreCase("O+")) {
            compatibleGroups = "'O+','O-'";
        } else if (bloodGroup.equalsIgnoreCase("O-")) {
            compatibleGroups = "'O-'";
        } else {
            response.getWriter().println("Invalid blood group.");
            return;
        }

        String sql = "SELECT * FROM donors WHERE blood_group IN (" +
                     compatibleGroups + ") AND eligible = 'YES' " +
                     "AND recent_illness = 'NO' ORDER BY city, name";

        try {
            Connection con = DatabaseConnection.getConnection();
            PreparedStatement pst = con.prepareStatement(sql);
            ResultSet rs = pst.executeQuery();
            // ... renders matching donor table
            rs.close();
            pst.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
  },
  reg: {
    title: 'Donor Registration',
    filename: 'DonorRegistrationServlet.java',
    desc: 'Saves donor info into MySQL donors table via PreparedStatement parameter indexing.',
    code: `package blooddonation;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/registerDonor")
public class DonorRegistrationServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        int age = Integer.parseInt(request.getParameter("age"));
        String gender = request.getParameter("gender");
        String bloodGroup = request.getParameter("bloodGroup");
        String phone = request.getParameter("phone");
        String email = request.getParameter("email");
        String city = request.getParameter("city");
        String eligible = request.getParameter("eligible");
        String recentIllness = request.getParameter("recentIllness");

        String sql = "INSERT INTO donors " +
                     "(name, age, gender, blood_group, phone, email, city, eligible, recent_illness) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            Connection con = DatabaseConnection.getConnection();
            PreparedStatement pst = con.prepareStatement(sql);

            pst.setString(1, name);
            pst.setInt(2, age);
            pst.setString(3, gender);
            pst.setString(4, bloodGroup);
            pst.setString(5, phone);
            pst.setString(6, email);
            pst.setString(7, city);
            pst.setString(8, eligible);
            pst.setString(9, recentIllness);

            int rows = pst.executeUpdate();
            pst.close();
            con.close();

            if (rows > 0) {
                response.sendRedirect("donor-login.jsp");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
  },
  donorLogin: {
    title: 'Donor Login',
    filename: 'DonorLoginServlet.java',
    desc: 'Verifies email and phone credentials and initializes session (donorId, donorName).',
    code: `package blooddonation;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/donorLogin")
public class DonorLoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String sql = "SELECT * FROM donors WHERE email = ? AND phone = ?";

        try {
            Connection con = DatabaseConnection.getConnection();
            PreparedStatement pst = con.prepareStatement(sql);
            pst.setString(1, email);
            pst.setString(2, phone);

            ResultSet rs = pst.executeQuery();
            if (rs.next()) {
                HttpSession session = request.getSession();
                session.setInt("donorId", rs.getInt("donor_id"));
                session.setAttribute("donorName", rs.getString("name"));
                response.sendRedirect("donor-dashboard.jsp");
            }
            rs.close();
            pst.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
  },
  hospLogin: {
    title: 'Hospital Login',
    filename: 'HospitalLoginServlet.java',
    desc: 'Verifies hospital username and password and initializes session.',
    code: `package blooddonation;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/hospitalLogin")
public class HospitalLoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String sql = "SELECT * FROM hospitals WHERE username = ? AND password = ?";

        try {
            Connection con = DatabaseConnection.getConnection();
            PreparedStatement pst = con.prepareStatement(sql);
            pst.setString(1, username);
            pst.setString(2, password);

            ResultSet rs = pst.executeQuery();
            if (rs.next()) {
                HttpSession session = request.getSession();
                session.setInt("hospitalId", rs.getInt("hospital_id"));
                session.setAttribute("hospitalName", rs.getString("hospital_name"));
                response.sendRedirect("hospital-dashboard.jsp");
            }
            rs.close();
            pst.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
  },
  bloodReq: {
    title: 'Blood Request Servlet',
    filename: 'BloodRequestServlet.java',
    desc: 'Inserts new blood request with recipient ID, blood group, units, and CURDATE().',
    code: `package blooddonation;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/bloodRequest")
public class BloodRequestServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        int recipientId = Integer.parseInt(request.getParameter("recipientId"));
        String bloodGroup = request.getParameter("bloodGroup");
        int units = Integer.parseInt(request.getParameter("units"));

        String sql = "INSERT INTO blood_requests " +
                     "(recipient_id, required_blood_group, units_required, request_date, status) " +
                     "VALUES (?, ?, ?, CURDATE(), 'PENDING')";

        try {
            Connection con = DatabaseConnection.getConnection();
            PreparedStatement pst = con.prepareStatement(sql);

            pst.setInt(1, recipientId);
            pst.setString(2, bloodGroup);
            pst.setInt(3, units);

            int rows = pst.executeUpdate();
            pst.close();
            con.close();

            if (rows > 0) {
                // Return confirmation with status: PENDING
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
  },
  model: {
    title: 'Recipient Entity Model',
    filename: 'Recipient.java',
    desc: 'Java Bean data model for recipient patient.',
    code: `package blooddonation;

public class Recipient {
    private int recipientId;
    private String name;
    private int age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String email;
    private String city;

    // Getters and Setters...
}`
  }
};

export const CodeInspectorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'servlets' | 'tables' | 'sqllog'>('sqllog');
  const [selectedJavaKey, setSelectedJavaKey] = useState<string>('search');
  const [copied, setCopied] = useState(false);

  const logs = dbService.getSqlLogs();
  const donors = dbService.getDonors();
  const hospitals = dbService.getHospitals();
  const recipients = dbService.getRecipients();
  const requests = dbService.getBloodRequests();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JAVA_FILES[selectedJavaKey].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-amber-300 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture & Execution Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Java Servlets & MySQL Database Engine
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Inspect the underlying Java Servlet source code, live MySQL table schemas, and real-time SQL execution logs powered by the application.
          </p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('sqllog')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'sqllog' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Live SQL Console ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('servlets')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'servlets' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Java Servlets
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tables' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            MySQL Tables
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: LIVE SQL CONSOLE ======================= */}
      {activeTab === 'sqllog' && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4 font-mono text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                Live PreparedStatement Trace (MySQL Driver Log)
              </span>
            </div>
            <button
              onClick={() => {
                dbService.clearSqlLogs();
                // trigger re-render
                setActiveTab('servlets');
                setTimeout(() => setActiveTab('sqllog'), 10);
              }}
              className="text-slate-500 hover:text-red-400 flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic p-8 text-center">
                No SQL logs yet. Perform an action like searching donors, registering, or requesting blood to view live execution logs!
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-amber-400 font-semibold">{log.servletName}</span>
                    </div>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="text-emerald-300 bg-black/40 p-2 rounded-lg break-all text-xs border border-emerald-900/30">
                    {log.sqlQuery}
                  </div>

                  {log.params && Object.keys(log.params).length > 0 && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg">
                      <span className="text-slate-500 font-bold">Bound Parameters: </span>
                      {Object.entries(log.params).map(([k, v]) => (
                        <span key={k} className="mr-3 font-mono">
                          <code className="text-amber-300 font-semibold">{k}</code>: <span className="text-slate-200">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: JAVA SERVLETS ======================= */}
      {activeTab === 'servlets' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-3 py-1">
              Java Files:
            </span>
            {Object.entries(JAVA_FILES).map(([k, file]) => (
              <button
                key={k}
                onClick={() => setSelectedJavaKey(k)}
                className={`w-full text-left p-3 rounded-2xl transition-all ${
                  selectedJavaKey === k
                    ? 'bg-red-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">{file.title}</div>
                <div className={`text-[11px] font-mono truncate ${
                  selectedJavaKey === k ? 'text-red-200' : 'text-slate-400'
                }`}>
                  {file.filename}
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-sm text-amber-300 font-bold">
                  {JAVA_FILES[selectedJavaKey].filename}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {JAVA_FILES[selectedJavaKey].desc}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-6 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{JAVA_FILES[selectedJavaKey].code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: MYSQL TABLES ======================= */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">donors table</span>
              <div className="text-2xl font-black text-red-700 mt-1">{donors.length}</div>
              <span className="text-[11px] text-slate-500">Registered donors</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">hospitals table</span>
              <div className="text-2xl font-black text-blue-700 mt-1">{hospitals.length}</div>
              <span className="text-[11px] text-slate-500">Partner medical centers</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">recipients table</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{recipients.length}</div>
              <span className="text-[11px] text-slate-500">Registered patients</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">blood_requests table</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{requests.length}</div>
              <span className="text-[11px] text-slate-500">Requests created</span>
            </div>
          </div>

          {/* Donors Table Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Table: `donors`</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Schema: donor_id (INT PK), name, age, gender, blood_group, phone, email, city, eligible, recent_illness
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {donors.length} rows
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2 px-3">donor_id</th>
                    <th className="py-2 px-3">name</th>
                    <th className="py-2 px-3">age</th>
                    <th className="py-2 px-3">gender</th>
                    <th className="py-2 px-3">blood_group</th>
                    <th className="py-2 px-3">phone</th>
                    <th className="py-2 px-3">city</th>
                    <th className="py-2 px-3">eligible</th>
                    <th className="py-2 px-3">recent_illness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donors.map(d => (
                    <tr key={d.donor_id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold">{d.donor_id}</td>
                      <td className="py-2 px-3 font-sans font-semibold">{d.name}</td>
                      <td className="py-2 px-3">{d.age}</td>
                      <td className="py-2 px-3">{d.gender}</td>
                      <td className="py-2 px-3 font-bold text-red-700">{d.blood_group}</td>
                      <td className="py-2 px-3">{d.phone}</td>
                      <td className="py-2 px-3">{d.city}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{d.eligible}</td>
                      <td className="py-2 px-3 font-bold text-slate-700">{d.recent_illness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
