import * as React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { GamePage } from "src/pages/game";
import { AccountPage } from "src/pages/account";
import { HomePage } from "src/pages/home";
import { Navigation } from "src/components/molecules/navigation";
import { SessionFormDrawer } from "src/components/organizms/session-form/session-form-drawer";
import { AppStore } from "src/app/context";

export const App = () => (
  <>
    <AppStore>
      <BrowserRouter>
        <div className="min-h-screen grid grid-rows-[auto_1fr]">
          <Navigation />
          <div>
            <Routes>
              <Route path="play/:tag" element={<GamePage />} />
              <Route path="account" element={<AccountPage />} />

              {/* Using path="*"" means "match anything", so this route
          acts like a catch-all for URLs that we don't have explicit
          routes for. */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppStore>
  </>
);
