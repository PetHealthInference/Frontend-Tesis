import { Outlet, useNavigate, NavLink } from "react-router";
import { Home, PawPrint, FileText, LogOut, UserRound } from "lucide-react";
import { authService } from "../../services/authService";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">VC</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-slate-100">VetClinic</span>
              </div>

              <div className="hidden md:flex gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </NavLink>

                <NavLink
                  to="/owners"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <UserRound className="w-5 h-5" />
                  <span>Propietarios</span>
                </NavLink>

                <NavLink
                  to="/patients"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <PawPrint className="w-5 h-5" />
                  <span>Pacientes</span>
                </NavLink>

                <NavLink
                  to="/evaluation"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <FileText className="w-5 h-5" />
                  <span>Evaluaciones</span>
                </NavLink>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Cerrar Sesion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
