'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { FarmlyTable, StatusBadge, ActionButton } from "@/components/farmly/FarmlyTable";
import { FarmlyButton } from "@/components/farmly/FarmlyButton";

import SingleLogSection, { SingleLog } from "../../components/SingleLogSection";
import BatchLogSection, { BatchLog } from "../../components/BatchLogSection";
import CostLogSection, { CostLog } from "../../components/CostLogSection";

const PAGE_SIZE = 8;

export default function LogsPage() {
  // Single logs state
  const [singleLogs, setSingleLogs] = useState<SingleLog[]>([]);
  const [singlePage, setSinglePage] = useState(1);
  const [singleTotal, setSingleTotal] = useState(0);
  // Batch logs state
  const [batchLogs, setBatchLogs] = useState<BatchLog[]>([]);
  const [batchPage, setBatchPage] = useState(1);
  const [batchTotal, setBatchTotal] = useState(0);
  // Cost logs state
  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [costPage, setCostPage] = useState(1);
  const [costTotal, setCostTotal] = useState(0);

  useEffect(() => {
    fetchSingleLogs();
  }, [singlePage]);
  useEffect(() => {
    fetchBatchLogs();
  }, [batchPage]);
  useEffect(() => {
    fetchCostLogs();
  }, [costPage]);

  // Fetch single-tree logs via API
  async function fetchSingleLogs() {
    try {
      const response = await fetch(`/api/logs/single?page=${singlePage}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch single logs');
      }
      const { logs, total } = await response.json();
      setSingleLogs(logs);
      setSingleTotal(total);
    } catch (error) {
      console.error('Error fetching single logs:', error);
      setSingleLogs([]);
      setSingleTotal(0);
    }
  }

  // Fetch batch logs via API
  async function fetchBatchLogs() {
    try {
      const response = await fetch(`/api/logs/batch?page=${batchPage}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch batch logs');
      }
      const responseData = await response.json();
      
      // Handle new API response format { success, data, total } vs old format { logs, total }
      if (responseData.success && responseData.data) {
        setBatchLogs(responseData.data);
        setBatchTotal(responseData.total);
      } else if (responseData.logs) {
        // Fallback for old format
        setBatchLogs(responseData.logs);
        setBatchTotal(responseData.total);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching batch logs:', error);
      setBatchLogs([]);
      setBatchTotal(0);
    }
  }

  // Fetch cost logs via API
  async function fetchCostLogs() {
    try {
      const response = await fetch(`/api/logs/cost?page=${costPage}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cost logs');
      }
      const { logs, total } = await response.json();
      setCostLogs(logs);
      setCostTotal(total);
    } catch (error) {
      console.error('Error fetching cost logs:', error);
      setCostLogs([]);
      setCostTotal(0);
    }
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] text-[#121a0f]">
      <Sidebar />
      <div className="layout-content-container flex flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="px-4 py-2 flex justify-center items-center space-x-4">
              <Link href="/logs/add-single" className="no-underline">
                <FarmlyButton variant="primary" size="md">
                  🌱 เพิ่มบันทึกต้นไม้
                </FarmlyButton>
              </Link>
              <Link href="/logs/add-batch" className="no-underline">
                <FarmlyButton variant="primary" size="md">
                  🌳 เพิ่มบันทึกแปลง
                </FarmlyButton>
              </Link>
              <Link href="/logs/cost" className="no-underline">
                <FarmlyButton variant="primary" size="md">
                  💰 เพิ่มค่าใช้จ่าย
                </FarmlyButton>
              </Link>
            </div>

            {/* Single Tree Logs Section */}
            <SingleLogSection
              logs={singleLogs}
              page={singlePage}
              totalPages={Math.ceil(singleTotal / PAGE_SIZE)}
              onPageChange={setSinglePage}
            />

            {/* Batch Logs Section */}
            <BatchLogSection
              logs={batchLogs}
              page={batchPage}
              totalPages={Math.ceil(batchTotal / PAGE_SIZE)}
              onPageChange={setBatchPage}
            />

            {/* Cost Logs Section */}
            <CostLogSection
              logs={costLogs}
              page={costPage}
              totalPages={Math.ceil(costTotal / PAGE_SIZE)}
              onPageChange={setCostPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}