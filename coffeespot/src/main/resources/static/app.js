const API = {
    drinks: "/api/drinks",
    ingredients: "/api/ingredients",
    deleteIngredient: (id) => `/api/ingredients/${id}`,
    recipes: "/api/recipes",
    recipesByDrink: (drinkId) => `/api/recipes/drink/${drinkId}`,
    deleteRecipeItem: (id) => `/api/recipes/${id}`,
    sellDrink: (drinkId) => `/api/drinks/${drinkId}/sell`,
};

const state = {
    drinks: [],
    ingredients: [],
    selectedDrinkId: null,
    recipeItems: [],
    recipeAvailable: true,
};

const els = {
    refreshBtn: document.getElementById("refreshBtn"),
    drinkForm: document.getElementById("drinkForm"),
    ingredientForm: document.getElementById("ingredientForm"),
    drinksList: document.getElementById("drinksList"),
    ingredientsList: document.getElementById("ingredientsList"),
    recipePanel: document.getElementById("recipePanel"),
    statusBox: document.getElementById("statusBox"),
};

function showStatus(message, type = "ok") {
    els.statusBox.hidden = false;
    els.statusBox.className = `status ${type}`;
    els.statusBox.textContent = message;
}

async function requestJson(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!res.ok) {
        let errorText = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            errorText = data.message || data.error || errorText;
        } catch {
            const raw = await res.text();
            if (raw) errorText = raw;
        }
        throw new Error(errorText);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function loadAll() {
    try {
        const [drinks, ingredients] = await Promise.all([
            requestJson(API.drinks),
            requestJson(API.ingredients),
        ]);
        state.drinks = Array.isArray(drinks) ? drinks : [];
        state.ingredients = Array.isArray(ingredients) ? ingredients : [];

        if (!state.selectedDrinkId && state.drinks.length > 0) {
            state.selectedDrinkId = state.drinks[0].id;
        }

        renderDrinks();
        renderIngredients();

        if (state.selectedDrinkId) {
            await loadRecipe(state.selectedDrinkId);
        } else {
            renderRecipe();
        }
    } catch (err) {
        showStatus(`Ошибка загрузки данных: ${err.message}`, "err");
    }
}

async function loadRecipe(drinkId) {
    state.selectedDrinkId = drinkId;
    renderDrinks();

    try {
        const items = await requestJson(API.recipesByDrink(drinkId));
        state.recipeAvailable = true;
        state.recipeItems = Array.isArray(items) ? items : [];
    } catch (err) {
        state.recipeAvailable = false;
        state.recipeItems = [];
        showStatus(`Не удалось загрузить рецепт: ${err.message}`, "err");
    }
    renderRecipe();
}

function renderDrinks() {
    if (state.drinks.length === 0) {
        els.drinksList.innerHTML = `<div class="item">Напитков пока нет</div>`;
        return;
    }

    els.drinksList.innerHTML = state.drinks
        .map((d) => {
            const active = d.id === state.selectedDrinkId ? "active" : "";
            return `
        <div class="item clickable ${active}" data-drink-id="${d.id}">
          <div>
            <div class="item-title">${escapeHtml(d.name)}</div>
            <div class="item-meta">${escapeHtml(d.category)} · ${d.volumeMl} мл</div>
          </div>
          <span class="badge">${d.price}</span>
        </div>
      `;
        })
        .join("");

    els.drinksList.querySelectorAll("[data-drink-id]").forEach((el) => {
        el.addEventListener("click", () => {
            loadRecipe(Number(el.dataset.drinkId));
        });
    });
}

function renderIngredients() {
    if (state.ingredients.length === 0) {
        els.ingredientsList.innerHTML = `<div class="item">Ингредиентов пока нет</div>`;
        return;
    }

    els.ingredientsList.innerHTML = state.ingredients
        .map((ing) => {
            const isOutOfStock = Number(ing.stockQuantity) <= 0;
            const deleteBtnHtml = isOutOfStock
                ? `<button type="button" class="btn-sm" data-delete-ingredient="${ing.id}" data-ing-name="${escapeHtml(ing.name)}">Удалить</button>`
                : "";

            return `
        <div class="item">
          <div>
            <div class="item-title">${escapeHtml(ing.name)}</div>
            <div class="item-meta">Ед.: ${escapeHtml(ing.unit)}</div>
          </div>
          <div class="item-actions">
            <span class="badge">${ing.stockQuantity}</span>
            ${deleteBtnHtml}
          </div>
        </div>
      `;
        })
        .join("");

    els.ingredientsList.querySelectorAll("[data-delete-ingredient]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.deleteIngredient);
            const name = btn.dataset.ingName;
            try {
                await requestJson(API.deleteIngredient(id), { method: "DELETE" });
                showStatus(`Закончившийся ингредиент «${name}» удалён.`, "ok");
                await loadAll();
            } catch (err) {
                showStatus(`Ошибка удаления ингредиента: ${err.message}`, "err");
            }
        });
    });
}

function renderRecipe() {
    const drink = state.drinks.find((d) => d.id === state.selectedDrinkId);
    if (!drink) {
        els.recipePanel.innerHTML = `<div class="item">Выберите напиток слева</div>`;
        return;
    }

    const recipeHtml = !state.recipeAvailable
        ? `<div class="item-meta">Рецепт пока недоступен</div>`
        : state.recipeItems.length === 0
            ? `<div class="item-meta">Для этого напитка рецепт пока не задан</div>`
            : state.recipeItems
                .map((item) => {
                    const ingName = item.ingredientName ?? item.ingredient?.name ?? `ID ${item.ingredientId ?? "?"}`;
                    const unit = item.unit ?? item.ingredient?.unit ?? "";
                    return `
              <div class="item">
                <span>${escapeHtml(ingName)}</span>
                <div class="item-actions">
                  <span class="badge">${item.quantityNeeded} ${escapeHtml(unit)}</span>
                  <button type="button" class="btn-sm" data-remove-recipe="${item.id}" data-ing-name="${escapeHtml(ingName)}">Убрать</button>
                </div>
              </div>
            `;
                })
                .join("");

    const ingredientOptions = state.ingredients.length
        ? [
            `<option value="" disabled selected>Выберите ингредиент</option>`,
            ...state.ingredients.map(
                (ing) =>
                    `<option value="${ing.id}">${escapeHtml(ing.name)} (${escapeHtml(ing.unit)}, ост.: ${ing.stockQuantity})</option>`
            ),
        ].join("")
        : `<option value="">Сначала добавьте ингредиент</option>`;

    const addRecipeFormHtml = state.recipeAvailable
        ? `
      <form id="recipeForm" class="form-grid">
        <select name="ingredientId" required>
          ${ingredientOptions}
        </select>
        <input name="quantityNeeded" type="number" step="0.01" min="0.01" placeholder="Сколько нужно (например, 150)" required />
        <button type="submit">Добавить в рецепт</button>
      </form>
    `
        : "";

    els.recipePanel.innerHTML = `
    <div class="item">
      <div>
        <div class="item-title">${escapeHtml(drink.name)}</div>
        <div class="item-meta">${escapeHtml(drink.category)} · ${drink.volumeMl} мл · ${drink.price}</div>
      </div>
      <button id="sellDrinkBtn" class="primary" type="button">Приготовить / Продать</button>
    </div>
    ${recipeHtml}
    ${addRecipeFormHtml}
  `;

    document
        .getElementById("sellDrinkBtn")
        .addEventListener("click", () => handleSellDrink(drink.id, drink.name));

    els.recipePanel.querySelectorAll("[data-remove-recipe]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const recipeId = Number(btn.dataset.removeRecipe);
            const ingName = btn.dataset.ingName;
            try {
                await requestJson(API.deleteRecipeItem(recipeId), { method: "DELETE" });
                showStatus(`Ингредиент «${ingName}» убран из рецепта.`, "ok");
                await loadRecipe(drink.id);
            } catch (err) {
                showStatus(`Ошибка удаления из рецепта: ${err.message}`, "err");
            }
        });
    });

    const recipeForm = document.getElementById("recipeForm");
    if (recipeForm) {
        recipeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(recipeForm);
            const ingredientId = Number(fd.get("ingredientId"));
            const quantityNeeded = Number(fd.get("quantityNeeded"));

            if (!ingredientId) {
                showStatus("Выберите ингредиент для рецепта.", "err");
                return;
            }

            try {
                await requestJson(API.recipes, {
                    method: "POST",
                    body: JSON.stringify({
                        drinkId: drink.id,
                        ingredientId,
                        quantityNeeded,
                    }),
                });
                recipeForm.reset();
                showStatus("Ингредиент добавлен в рецепт.", "ok");
                await loadRecipe(drink.id);
            } catch (err) {
                showStatus(`Ошибка добавления в рецепт: ${err.message}`, "err");
            }
        });
    }
}

async function handleSellDrink(drinkId, drinkName) {
    try {
        await requestJson(API.sellDrink(drinkId), { method: "POST" });
        showStatus(`Напиток «${drinkName}» продан, остатки ингредиентов списаны.`, "ok");
        await loadAll();
    } catch (err) {
        showStatus(`Не удалось провести продажу: ${err.message}`, "err");
    }
}

els.drinkForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(els.drinkForm);
    const payload = {
        name: String(fd.get("name")).trim(),
        category: String(fd.get("category")).trim(),
        volumeMl: Number(fd.get("volumeMl")),
        price: Number(fd.get("price")),
    };

    try {
        await requestJson(API.drinks, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        els.drinkForm.reset();
        showStatus(`Напиток «${payload.name}» добавлен.`, "ok");
        await loadAll();
    } catch (err) {
        showStatus(`Ошибка создания напитка: ${err.message}`, "err");
    }
});

els.ingredientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(els.ingredientForm);
    const payload = {
        name: String(fd.get("name")).trim(),
        unit: String(fd.get("unit")).trim(),
        stockQuantity: Number(fd.get("stockQuantity")),
    };

    try {
        await requestJson(API.ingredients, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        els.ingredientForm.reset();
        showStatus(`Ингредиент «${payload.name}» добавлен.`, "ok");
        await loadAll();
    } catch (err) {
        showStatus(`Ошибка создания ингредиента: ${err.message}`, "err");
    }
});

els.refreshBtn.addEventListener("click", loadAll);

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

loadAll();