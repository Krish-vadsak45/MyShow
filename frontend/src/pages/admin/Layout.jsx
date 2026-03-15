import React, { Suspense, useEffect } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import AccessDenied from "@/components/admin/AccessDenied";
import { AdminContentSkeleton } from "@/components/skeletons";

const Layout = () => {
  const { isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    async function fetchData() {
      await fetchIsAdmin();
    }
    fetchData();
  }, []);

  return isAdmin === true ? (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Suspense fallback={<AdminContentSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </>
  ) : isAdmin === false ? (
    <AccessDenied />
  ) : (
    isAdmin === null && <Loading />
  );
};

export default Layout;
