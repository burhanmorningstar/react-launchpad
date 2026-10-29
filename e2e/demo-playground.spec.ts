import { expect, test } from '@playwright/test'

test.describe('Playground and Demo Screen Chromium Verification', () => {
  test('exhaustively verifies all interactive components in Chromium', async ({
    page,
  }) => {
    // 1. Visit root page
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()

    // 2. Test Global Keyboard Shortcut (Ctrl+K / Cmd+K)
    await page.keyboard.press('Control+k')
    const commandDialog = page.getByRole('dialog', { name: 'Command Palette' })
    await expect(commandDialog).toBeVisible()

    // Search and select tab via Command Palette
    const commandInput = page.getByPlaceholder('Bir komut veya bölüm arayın...')
    await commandInput.fill('Formlar')
    const formOption = page.getByRole('option', {
      name: /Formlar ve Doğrulama/i,
    })
    await expect(formOption).toBeVisible()
    await formOption.click()
    await expect(commandDialog).not.toBeVisible()

    // Verify Tab 2 (Forms) is now active
    await expect(
      page.getByRole('tab', { name: /Form Deneyimi/i })
    ).toHaveAttribute('data-state', 'active')

    // 3. Test Tab 2: Forms & Validation
    const fillDemoBtn = page.getByRole('button', {
      name: /Demo Verisi Doldur/i,
    })
    await fillDemoBtn.click()

    // Verify Form Live State Inspector shows "Geçerli"
    await expect(page.getByText('Geçerli')).toBeVisible()
    await expect(page.getByText('aybars@launchpad.dev')).toBeVisible()

    // Submit form
    const submitBtn = page.getByRole('button', {
      name: /Formu Gönder ve Doğrula/i,
    })
    await submitBtn.click()

    // 4. Test Tab 1: Primitives
    const primitivesTab = page.getByRole('tab', { name: /UI Primitives/i })
    await primitivesTab.click()
    await expect(primitivesTab).toHaveAttribute('data-state', 'active')

    // Test Loading Button
    const loadingSimBtn = page.getByRole('button', {
      name: /Loading Simülasyonu/i,
    })
    await loadingSimBtn.click()
    await expect(page.getByText('İşleniyor...')).toBeVisible()

    // Test Accordion
    const accordionTrigger = page.getByRole('button', {
      name: /Backend olmadan nasıl test ve geliştirme yapılıyor\?/i,
    })
    await accordionTrigger.click()
    await expect(
      page.getByText(/In-memory demoAuth, MSW ağ yakalayıcıları/i)
    ).toBeVisible()

    // 5. Test Tab 3: Tables
    const tablesTab = page.getByRole('tab', { name: /Veri Tablosu/i })
    await tablesTab.click()
    await expect(tablesTab).toHaveAttribute('data-state', 'active')

    // Test Search filtering
    const searchInput = page.getByPlaceholder('İsim, rol veya e-posta...')
    await searchInput.fill('Zeynep')
    await expect(page.getByText('zeynep.kaya@launchpad.dev')).toBeVisible()
    await expect(page.getByText('Ahmet Yılmaz')).not.toBeVisible()

    // Clear search
    await searchInput.fill('')
    await expect(page.getByText('Ahmet Yılmaz')).toBeVisible()

    // Test sorting
    const commitSortBtn = page.getByRole('button', { name: /Commit/i })
    await commitSortBtn.click()

    // Test checkbox row selection
    const firstCheckbox = page.getByRole('checkbox', {
      name: /Seç: Elif Şahin/i,
    })
    await firstCheckbox.click()
    await expect(page.getByText('1 satır seçildi')).toBeVisible()

    // 6. Test Tab 4: Overlays & Modals
    const overlaysTab = page.getByRole('tab', { name: /Modallar & Toasts/i })
    await overlaysTab.click()
    await expect(overlaysTab).toHaveAttribute('data-state', 'active')

    // Open and verify Dialog
    const openModalBtn = page.getByRole('button', {
      name: /Kullanıcı Davet Et \(Modal\)/i,
    })
    await openModalBtn.click()
    const inviteDialog = page.getByRole('dialog', {
      name: /Yeni Ekip Üyesi Davet Et/i,
    })
    await expect(inviteDialog).toBeVisible()

    // Fill email and submit
    await page.getByLabel('E-Posta Adresi').fill('yeni.uye@launchpad.dev')
    const sendInviteBtn = page.getByRole('button', {
      name: /Davet Bağlantısı Gönder/i,
    })
    await sendInviteBtn.click()
    await expect(inviteDialog).not.toBeVisible()

    // Open and verify Sheet (Drawer)
    const openSheetBtn = page.getByRole('button', {
      name: /Yan Paneli Aç \(Sheet\)/i,
    })
    await openSheetBtn.click()
    const sheetDialog = page.getByRole('dialog', {
      name: /Kullanıcı Tercihleri/i,
    })
    await expect(sheetDialog).toBeVisible()

    const closeSheetBtn = page.getByRole('button', {
      name: /Kaydet ve Paneli Kapat/i,
    })
    await closeSheetBtn.click()
    await expect(sheetDialog).not.toBeVisible()

    // 7. Test Tab 5: Charts
    const chartsTab = page.getByRole('tab', { name: /Grafikler/i })
    await chartsTab.click()
    await expect(chartsTab).toHaveAttribute('data-state', 'active')

    // Switch dataset
    const apiBtn = page.getByRole('button', { name: 'API İstekleri' })
    await apiBtn.click()
    await expect(page.getByText('Haftalık API Çağrı Dağılımı')).toBeVisible()

    // Test Table alternative
    const viewTableBtn = page.getByRole('button', {
      name: /View as data table/i,
    })
    await viewTableBtn.click()
    await expect(page.getByRole('table')).toBeVisible()
    const viewChartBtn = page.getByRole('button', {
      name: /View as data table/i,
    })
    await viewChartBtn.click()

    // 8. Test Tab 6: Files
    const filesTab = page.getByRole('tab', { name: /Dosya Yükleme/i })
    await filesTab.click()
    await expect(filesTab).toHaveAttribute('data-state', 'active')
    await expect(
      page.getByText(/Dosyaları bu alana sürükleyip bırakın veya seçin/i)
    ).toBeVisible()

    // 9. Test Tab 7: Enterprise Stack (Analytics, i18n, Flags, Web Vitals)
    const enterpriseTab = page.getByRole('tab', { name: /Kurumsal Stack/i })
    await enterpriseTab.click()
    await expect(enterpriseTab).toHaveAttribute('data-state', 'active')
    await expect(
      page.getByText('README.md Kurumsal Altyapı Standartları')
    ).toBeVisible()

    // Test PostHog Analytics Event emitter
    const emitEventBtn = page.getByRole('button', {
      name: /Olay Gönder \(trackEvent\)/i,
    })
    await emitEventBtn.click()
    await expect(page.getByText(/demo_cta_clicked/).first()).toBeVisible()

    // Test Feature Flag toggle
    const aiFlagSwitch = page.getByRole('switch').first()
    await aiFlagSwitch.scrollIntoViewIfNeeded()
    await aiFlagSwitch.click({ force: true })
    await expect(page.getByText('AI Copilot Asistanı Devrede:')).toBeVisible()

    // Test i18n live language switch
    const enLangBtn = page.getByRole('button', { name: /English \(EN\)/i })
    await enLangBtn.scrollIntoViewIfNeeded()
    await enLangBtn.click({ force: true })
    await expect(page.getByText('"Submit"')).toBeVisible()

    const trLangBtn = page.getByRole('button', { name: /Türkçe \(TR\)/i })
    await trLangBtn.scrollIntoViewIfNeeded()
    await trLangBtn.click({ force: true })
    await expect(page.getByText('"Gönder"')).toBeVisible()

    // Verify Core Web Vitals and README capabilities
    await expect(page.getByText('0.78s')).toBeVisible()
    await expect(page.getByText('0.000')).toBeVisible()
    await expect(
      page.getByText('181.55 KiB', { exact: true }).first()
    ).toBeVisible()
    await expect(page.getByText('PostHog SDK')).toBeVisible()
    await expect(page.getByText('TanStack Query v5 + Zustand')).toBeVisible()
  })
})
